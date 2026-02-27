import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getBackendUrl } from "@/constants/backend";

import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

const BACKEND_URL = getBackendUrl();

type ImageResult = {
  image: string;
};

export default function StoryMaker() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);

  /* =========================
     GENERATE IMAGE
     ========================= */
  const handleGenerateImage = async () => {
    if (!story.trim()) {
      Alert.alert("Please enter a prompt 😺");
      return;
    }

    setLoading(true);
    setImageResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: story }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (!data.image) throw new Error("No image returned");

      setImageResult({ image: data.image });
    } catch {
      Alert.alert("Error", "Image generation failed 😿");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DOWNLOAD IMAGE (FIXED)
     ========================= */
  const handleDownloadImage = async () => {
    try {
      if (!imageResult) return;

      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required to save image");
        return;
      }

      const fileUri =
        FileSystem.cacheDirectory + `garfield-${Date.now()}.png`;

      // write base64 → file
      await FileSystem.writeAsStringAsync(fileUri, imageResult.image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // ✅ more reliable than saveToLibraryAsync
      const asset = await MediaLibrary.createAssetAsync(fileUri);

      await MediaLibrary.createAlbumAsync("Garfield Comics", asset, false);

      Alert.alert("Downloaded 😺", "Saved to your gallery!");
    } catch (err) {
      console.log(err);
      Alert.alert("Failed to download");
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff7ed" }}>
      {/* ✅ Scroll added */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderColor: "#f2d7b6",
          }}
        >
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>←</Text>
          </TouchableOpacity>

          <View>
            <Text style={{ fontSize: 20, fontWeight: "900" }}>
              Garfield Comic Maker 🐾
            </Text>
            <Text style={{ fontSize: 13, color: "#777" }}>
              Draw something funny!
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Prompt */}
          <TextInput
            value={story}
            onChangeText={setStory}
            placeholder="Garfield eating lasagna in space..."
            multiline
            style={{
              height: 120,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 16,
              borderWidth: 2,
              borderColor: "#f4cfa3",
              marginBottom: 20,
              textAlignVertical: "top",
            }}
          />

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGenerateImage}
            disabled={loading}
            style={{
              backgroundColor: "#f4a534",
              padding: 16,
              borderRadius: 30,
              borderWidth: 3,
              borderColor: "#000",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={{ fontWeight: "900", fontSize: 18 }}>
                GENERATE ✨
              </Text>
            )}
          </TouchableOpacity>

          {/* Image Result */}
          {imageResult && (
            <View style={{ alignItems: "center" }}>
              <Image
                source={{
                  uri: `data:image/png;base64,${imageResult.image}`,
                }}
                style={{
                  width: "100%",
                  height: 300,
                  borderRadius: 20,
                  borderWidth: 3,
                  borderColor: "#000",
                  marginBottom: 20,
                }}
                resizeMode="contain"
              />

              {/* 🔥 GARFIELD STYLE DOWNLOAD BUTTON */}
              <TouchableOpacity
                onPress={handleDownloadImage}
                style={{
                  backgroundColor: "#ff8c00", // orange
                  paddingVertical: 14,
                  paddingHorizontal: 26,
                  borderRadius: 30,
                  borderWidth: 4,
                  borderColor: "#000",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 6,
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  🐱⬇ Download Comic
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
