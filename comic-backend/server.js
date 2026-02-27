require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   GLOBAL MIDDLEWARE
   ========================= */
app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK (DEBUG)
   ========================= */
app.get("/test", (req, res) => {
  res.send("✅ Server working");
});

/* =========================
   🗣️ CHAT ENDPOINT
   ========================= */
app.post("/chat", async (req, res) => {
  console.log("🔥 /chat HIT");

  try {
    const { message } = req.body;

    if (!message) return res.json({ reply: "No message received 😼" });
    if (!process.env.OPENAI_API_KEY)
      return res.json({ reply: "API key missing ❌" });

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Garfield the cat. Lazy, funny, sarcastic, kid-friendly.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // ✅ 60s timeout
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Garfield is sleepy 💤";

    res.json({ reply });
  } catch (err) {
    console.error("❌ CHAT ERROR:", err.response?.data || err.message);
    res.json({ reply: "Garfield had a brain nap 💤" });
  }
});

/* =========================
   🖼️ IMAGE ENDPOINT
   ========================= */
app.post("/image", async (req, res) => {
  console.log("🖼️ /image HIT");

  try {
    const { prompt } = req.body;

    if (!prompt)
      return res.status(400).json({ error: "Prompt required" });

    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "gpt-image-1",
        prompt: `Cute comic-style with given context ${prompt}`,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 120000, // ✅ VERY IMPORTANT (2 min for image)
      }
    );

    const imageBase64 = response.data?.data?.[0]?.b64_json;

    if (!imageBase64)
      return res.status(500).json({ error: "Image generation failed" });

    res.json({ image: imageBase64 });
  } catch (err) {
    console.error("❌ IMAGE ERROR:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Garfield spilled lasagna on the server 🍝" });
  }
});

/* =========================
   🔊 VOICE (ELEVENLABS)
   ========================= */
app.post("/voice", async (req, res) => {
  console.log("🔊 /voice HIT");

  try {
    const { text } = req.body || {};

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ELEVENLABS_API_KEY missing" });
    }

    if (!process.env.ELEVENLABS_VOICE_ID) {
      return res.status(500).json({ error: "ELEVENLABS_VOICE_ID missing" });
    }

    const speechText =
      text?.trim() ||
      "Hey kiddo, I'm Garfield. Wake me up with lasagna.";

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
      {
        text: speechText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );

    const audioBase64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ audio: audioBase64 });
  } catch (err) {
    console.error("❌ VOICE ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Voice generation failed" });
  }
});

/* =========================
   🎤 SPEECH-TO-SPEECH (OPENAI)
   ========================= */
app.post("/speech-to-speech", upload.single("file"), async (req, res) => {
  console.log("🎤 /speech-to-speech HIT");

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Audio file missing" });
    }

    // 1) Transcribe user audio -> text
    const transcribeForm = new FormData();
    transcribeForm.append("file", req.file.buffer, {
      filename: req.file.originalname || "speech.m4a",
      contentType: req.file.mimetype || "audio/m4a",
    });
    transcribeForm.append("model", "whisper-1");

    const transcribeRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      transcribeForm,
      {
        headers: {
          ...transcribeForm.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 60000,
      }
    );

    const userText = transcribeRes.data?.text?.trim();
    if (!userText) {
      return res.status(500).json({ error: "Transcription failed" });
    }

    // 2) Generate assistant reply (Garfield persona)
    const chatRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Garfield the cat. Lazy, funny, sarcastic, kid-friendly. Keep responses to 1-2 short sentences.",
          },
          { role: "user", content: userText },
        ],
        max_tokens: 80,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const reply =
      chatRes.data?.choices?.[0]?.message?.content ||
      "Garfield is sleepy 💤";

    // 3) Convert reply text -> speech
    const ttsRes = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1",
        input: reply,
        voice: process.env.OPENAI_TTS_VOICE || "alloy",
        response_format: "mp3",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );

    const audioBase64 = Buffer.from(ttsRes.data, "binary").toString("base64");
    res.json({ audio: audioBase64 });
  } catch (err) {
    const status = err.response?.status || 500;
    const details = err.response?.data || err.message;
    console.error("❌ SPEECH-TO-SPEECH ERROR:", details);
    res.status(status).json({
      error: "Speech-to-speech failed",
      details,
    });
  }
});

/* =========================
   🚀 START SERVER  (MOST IMPORTANT FIX)
   ========================= */
const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://YOUR_IP:${PORT}  (use this in mobile app)`);
});
