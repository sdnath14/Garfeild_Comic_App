import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff7ed" }}>
      {/* ================= HEADER ================= */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 22 }}>☰</Text>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Garfield Comic Creator
        </Text>

        <Text style={{ fontSize: 18 }}>⚙️</Text>
      </View>

      {/* ================= MAIN CONTENT ================= */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        {/* Garfield Card */}
        <View
          style={{
            backgroundColor: "#fdecc8",
            borderRadius: 28,
            padding: 24,
            marginBottom: 30,
            width: "100%",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 6,
          }}
        >
          {/* ✅ FIXED PATH HERE */}
          <Image
            source={require("./assets/garfield.png")}
            style={{ width: 260, height: 260 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "900",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          HI! I&apos;M{"\n"}GARFIELD!
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 15,
            color: "#444",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Ready to make your very own comic book?
          {"\n"}Let&apos;s have some fun!
        </Text>

        {/* ================= BUTTONS ================= */}

        {/* 🟠 START CREATING */}
        <TouchableOpacity
          onPress={() => router.push("/story-maker")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#f4a534",
            paddingVertical: 14,
            paddingHorizontal: 44,
            borderRadius: 32,
            borderWidth: 3,
            borderColor: "#000",
            marginBottom: 16,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: "#000",
            }}
          >
            START CREATING!
          </Text>
        </TouchableOpacity>

        {/* 💬 TEXT CHAT */}
        <TouchableOpacity
          onPress={() => router.push("/garfield-ai")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#fdecc8",
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: "#000",
            marginBottom: 14,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#000",
            }}
          >
            💬 Talk with Garfield
          </Text>
        </TouchableOpacity>

        {/* 🎤 VOICE ASSISTANT */}
        <TouchableOpacity
          onPress={() => router.push("/voice-agent")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#d2691e",
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: "#000",
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "900",
              color: "#fff",
            }}
          >
            🎤 Voice Assistant
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= FOOTER ================= */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 32,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 12, color: "#666" }}>KID-SAFE AI</Text>
        <Text style={{ fontSize: 12, color: "#666" }}>PARENT PORTAL</Text>
      </View>
    </SafeAreaView>
  );
}
