export default {
  expo: {
    name: "kids-comic-app",
    slug: "kids-comic-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./app/assets/garfield.png",
    scheme: "kidscomicapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.kids-comic-app",
      infoPlist: {
        NSMicrophoneUsageDescription:
          "This app needs microphone access so Garfield can hear you.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./app/assets/garfield.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["RECORD_AUDIO"],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./app/assets/garfield.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./app/assets/garfield.png",
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      BACKEND_URL: process.env.BACKEND_URL,
    },
  },
};
