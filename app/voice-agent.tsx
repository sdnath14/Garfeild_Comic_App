import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { getBackendUrl } from "@/constants/backend";

const BACKEND_URL = getBackendUrl();

export default function VoiceAgent() {
  const insets = useSafeAreaInsets();
  const pawScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");

  const handlePawPressIn = () => {
    Animated.spring(pawScale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePawPressOut = () => {
    Animated.spring(pawScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (loadingVoice) {
      pulse.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
    }

    return () => {
      loop?.stop();
    };
  }, [loadingVoice, pulse]);

  const startRecording = async () => {
    if (loadingVoice || isRecording) return;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus("Mic permission denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setStatus("");

      // Auto-stop after 4 seconds for faster response
      setTimeout(() => {
        if (recordingRef.current) {
          stopRecordingAndRespond();
        }
      }, 4000);
    } catch (err) {
      console.log("Recording start error:", err);
      setStatus("Recording failed");
    }
  };

  const stopRecordingAndRespond = async () => {
    if (!isRecording || loadingVoice) return;
    setLoadingVoice(true);
    setIsRecording(false);

    try {
      const recording = recordingRef.current;
      if (!recording) throw new Error("No recording in progress");
      const recStatus = await recording.getStatusAsync();
      if (recStatus.durationMillis && recStatus.durationMillis < 300) {
        setStatus("Hold a bit longer");
        await recording.stopAndUnloadAsync();
        recordingRef.current = null;
        setLoadingVoice(false);
        return;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("No recording URI");

      const mimeType = "audio/m4a";

      const form = new FormData();
      form.append("file", {
        uri,
        name: `speech.m4a`,
        type: mimeType,
      } as any);

      const res = await fetch(`${BACKEND_URL}/speech-to-speech`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: form,
      });

      if (!res.ok) {
        const errText = await res.text();
        const msg = `Voice request failed (${res.status})`;
        setStatus(errText ? `${msg}: ${errText}` : msg);
        throw new Error(errText || msg);
      }

      const data = await res.json();
      if (!data?.audio) throw new Error("No audio returned");

      const fileUri =
        FileSystem.cacheDirectory + `garfield-voice-${Date.now()}.mp3`;
      const encoding = FileSystem.EncodingType?.Base64 || "base64";
      await FileSystem.writeAsStringAsync(fileUri, data.audio, {
        encoding,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
    } catch (err) {
      console.log("Voice error:", err);
      setStatus("Voice response failed");
    } finally {
      setLoadingVoice(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= BACK BUTTON ================= */}
      <Pressable
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.replace("/")}   // ✅ ALWAYS goes home
      >
      <Text style={{ fontSize: 22 }}>←</Text>
      </Pressable>


      {/* ================= HEADER ================= */}
      <Text style={styles.title}>Sleepy Mode</Text>
      <Text style={styles.subtitle}>Listening for your voice...</Text>


      {/* ================= CIRCULAR GARFIELD IMAGE ================= */}
      <View style={styles.circle}>
        <Image
          source={require("./assets/gf2.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>


      {/* ================= QUOTE ================= */}
      <Text style={styles.quote}>
        &quot;I&apos;m not lazy, I&apos;m on energy saving mode.&quot;
      </Text>


      {/* ================= BUTTON ================= */}
      <View style={styles.buttonWrap}>
        {loadingVoice && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                opacity: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.35, 0],
                }),
                transform: [
                  {
                    scale: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.7],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
        <Pressable
          style={styles.button}
          onPressIn={() => {
            handlePawPressIn();
            startRecording();
          }}
          onPressOut={() => {
            handlePawPressOut();
            stopRecordingAndRespond();
          }}
        >
          <Animated.View style={{ transform: [{ scale: pawScale }] }}>
            <Text style={{ fontSize: 32 }}>🐾</Text>
          </Animated.View>
        </Pressable>
      </View>

      <Text style={styles.tap}>
        {loadingVoice
          ? "RESPONDING..."
          : isRecording
          ? "LISTENING..."
          : "HOLD TO TALK"}
      </Text>
      {!!status && <Text style={styles.status}>{status}</Text>}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6B667",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===== Back button ===== */
  backBtn: {
    position: "absolute",
    left: 15,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    elevation: 4,
    zIndex: 10,
  },

  backText: {
    fontWeight: "700",
    color: "#2b1b0e",
  },

  /* ===== Text ===== */
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#2b1b0e",
  },

  subtitle: {
    fontSize: 14,
    color: "#5e3d21",
    marginBottom: 30,
  },

  /* ===== Perfect circle image ===== */
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    overflow: "hidden", // ⭐ makes it circular
    backgroundColor: "#fff2e0",
    elevation: 8,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  quote: {
    marginTop: 35,
    fontStyle: "italic",
    textAlign: "center",
    color: "#3d2a16",
    paddingHorizontal: 30,
  },

  /* ===== Paw button ===== */
  buttonWrap: {
    marginTop: 40,
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#ff9a2e",
    backgroundColor: "#ffd2a1",
  },

  button: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#ff8c1a",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  tap: {
    marginTop: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  status: {
    marginTop: 8,
    color: "#7a1d1d",
    fontWeight: "600",
  },
});
