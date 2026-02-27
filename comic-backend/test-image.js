require("dotenv").config();
const https = require("https");

const data = JSON.stringify({
  model: "gpt-image-1",
  prompt: "A funny Garfield-style comic cat eating lasagna",
  size: "1024x1024"
});

const options = {
  hostname: "api.openai.com",
  path: "/v1/images/generations",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Length": data.length
  }
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("✅ RESPONSE:\n", body);
  });
});

req.on("error", error => {
  console.error("❌ ERROR:", error);
});

req.write(data);
req.end();
