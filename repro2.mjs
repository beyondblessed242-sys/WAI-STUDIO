import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL },
});

const avatar = fs.readFileSync("/tmp/avatar.jpg").toString("base64");
const product = fs.readFileSync("/tmp/product.jpg").toString("base64");

const prompt = [
  "Generate one polished, photorealistic UGC product photograph.",
  "Use the attached private creator/avatar and product references as the visual source of truth.",
  "Scene type: At-home testimonial.",
  "Product category: Beauty & skincare.",
  "Creator details: young woman, warm smile.",
  "Identity Lock is enabled: prioritize the creator reference's visual continuity across this original or variation. Do not claim perfect identity preservation.",
  "Background: Warm, lived-in apartment.",
  "Lighting: Soft window daylight.",
  "Outfit styling: Relaxed elevated everyday.",
  "Pose and scene direction: Holding the product naturally while sharing a personal recommendation.",
  "Output framing: 3:4; requested finish: standard.",
  "Create the original requested scene.",
  "Keep product packaging, text, and branding faithful to the product reference where visible. Do not add watermarks, text overlays, collages, or a split screen.",
  "Variation number 1 of 1.",
].join("\n");

const parts = [
  { text: prompt },
  { inlineData: { mimeType: "image/jpeg", data: avatar } },
  { inlineData: { mimeType: "image/jpeg", data: product } },
];

const config = {
  responseModalities: ["IMAGE"],
  imageConfig: { aspectRatio: "3:4", imageSize: "1K" },
};

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts }],
    config,
  });
  console.log("candidates length:", response.candidates?.length);
  console.log("promptFeedback:", JSON.stringify(response.promptFeedback));
  for (const c of response.candidates ?? []) {
    console.log("finishReason:", c.finishReason, "safetyRatings:", JSON.stringify(c.safetyRatings));
    console.log("parts kinds:", (c.content?.parts ?? []).map(p => Object.keys(p)));
  }
} catch (error) {
  console.log("ERROR NAME:", error?.constructor?.name);
  console.log("ERROR MESSAGE:", error?.message);
  console.log("ERROR STATUS:", error?.status ?? error?.code);
}
