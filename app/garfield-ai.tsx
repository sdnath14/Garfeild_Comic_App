import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getBackendUrl } from "@/constants/backend";

const BACKEND_URL = getBackendUrl();

type Message = {
  from: "user" | "garfield";
  text: string;
};

export default function GarfieldAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { from: "garfield", text: "Hey kiddo 😼 I’m Garfield! Talk to me." },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");

    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      setMessages((prev) => [
        ...prev,
        { from: "garfield", text: data.reply || "Meow… 💤" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "garfield", text: "Oops… Garfield broke the chat 😿" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff7ed" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#f2d7b6",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "900" }}>
            🐱 Talk to Garfield
          </Text>
          <Text style={{ fontSize: 12, color: "#777" }}>
            Lazy • Funny • Loves Lasagna
          </Text>
        </View>
      </View>

      {/* CHAT AREA */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 20,
        }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={{
              alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
              backgroundColor:
                msg.from === "user" ? "#f4a534" : "#fdecc8",
              padding: 12,
              borderRadius: 18,
              marginBottom: 10,
              maxWidth: "80%", // ✅ keeps bubbles inside screen
            }}
          >
            <Text style={{ fontSize: 15 }}>{msg.text}</Text>
          </View>
        ))}

        {loading && (
          <Text style={{ color: "#999", fontSize: 13 }}>
            Garfield is thinking… 💤
          </Text>
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderColor: "#f2d7b6",
          backgroundColor: "#fff",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Say something to Garfield…"
          style={{
            flex: 1,
            backgroundColor: "#fff7ed",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginRight: 8,
            fontSize: 14,
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#f4a534",
            borderRadius: 20,
            paddingHorizontal: 18,
            height: 40,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "900" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
