import express from "express";
import { db } from "../middleware/auth.js";
import { FieldValue } from "firebase-admin/firestore";
import {
  isGeminiModelUnavailableError,
  withGeminiModel,
} from "../lib/gemini.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "chat" });
});


const parseSuggestedChips = (chipsText) => {
  const jsonArrayMatch = chipsText.match(/\[.*\]/s);
  if (jsonArrayMatch) {
    return JSON.parse(jsonArrayMatch[0]);
  }

  try {
    return JSON.parse(chipsText);
  } catch {
    return chipsText
      .split("\n")
      .map((line) =>
        line
          .replace(/^[\s*\-\d.)]+/, "")
          .replace(/^["']|["']$/g, "")
          .trim(),
      )
      .filter(Boolean);
  }
};

const normalizeSuggestedChips = (chips = []) =>
  chips
    .map((chip) =>
      String(chip)
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^["']|["']$/g, "")
        .trim(),
    )
    .filter((chip) => chip && chip.length <= 40);

const fallbackSuggestedChips = [
  "Tell me more",
  "What's next?",
  "How do I start?",
];

router.post("/", async (req, res) => {
  try {
    const {
      message,
      sessionId,
      step,
      state,
      firstVoter,
      history = [],
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { replyText, emotion, suggestedChips } = await withGeminiModel(
      async (model) => {
        // Step 1: Emotion Classification
        const emotionPrompt = `Classify this message into exactly one word: confused | skeptical | engaged | neutral.
Message: '${message}'. Reply with only the single word, nothing else.`;

        let emotion = "neutral";
        try {
          const emotionResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: emotionPrompt }] }],
            generationConfig: { maxOutputTokens: 5, temperature: 0.1 },
          });
          const rawEmotion = emotionResult.response.text().trim().toLowerCase();
          if (
            ["confused", "skeptical", "engaged", "neutral"].includes(
              rawEmotion,
            )
          ) {
            emotion = rawEmotion;
          }
        } catch (e) {
          if (isGeminiModelUnavailableError(e)) {
            throw e;
          }
        }

        // Step 2: Main Gemini Call
        let emotionAppend = "";
        if (emotion === "confused")
          emotionAppend =
            "The user sounds confused. Use extremely simple language. Short sentences. One idea at a time. Be warm and reassuring.";
        if (emotion === "skeptical")
          emotionAppend =
            "The user sounds skeptical. Be factual and cite official sources like eci.gov.in or nvsp.in. No fluff, just verified information.";
        if (emotion === "engaged")
          emotionAppend =
            "The user is engaged and curious. Go deeper, share interesting civic facts, explain the why behind each process.";
        if (emotion === "neutral")
          emotionAppend = "Keep a friendly, conversational tone.";

        const systemPrompt = `You are Civiq, a friendly, politically 100% neutral civic education co-pilot for Indian elections. You guide users through 5 steps: 1) Check registration, 2) Find polling booth, 3) Know candidates, 4) Understand ballot, 5) Set reminder.
You NEVER express political opinions or favor any party. Provide helpful, complete, and easy-to-understand answers to user questions. Always end with one clear next action the user should take to continue their journey.
${emotionAppend}
Context Variables: User State: ${state || "Unknown"}, First-Time Voter: ${firstVoter ? "Yes" : "No"}, Current Journey Step: ${step || 1}.`;


        const chatHistory = [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I am Civiq, ready to help." }],
          },
          ...history.map((msg) => ({
            role:
              msg.role === "model" || msg.role === "bot" ? "model" : "user",
            parts: [{ text: msg.text }],
          })),
        ];

        const chatSession = model.startChat({
          history: chatHistory,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        });

        const mainResult = await chatSession.sendMessage([{ text: message }]);
        const replyText = mainResult.response.text();



        // Step 3: Suggester Chips
        const chipsPrompt = `Given this AI reply about Indian elections step ${step}, suggest exactly 3 short follow-up questions a user might ask. Each under 8 words. Return as JSON array only.
AI Reply: "${replyText}"`;

        let suggestedChips = [];
        try {
          const chipsResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: chipsPrompt }] }],
            generationConfig: { maxOutputTokens: 60, temperature: 0.3 },
          });
          const chipsText = chipsResult.response.text();
          suggestedChips = normalizeSuggestedChips(
            parseSuggestedChips(chipsText),
          );
        } catch (e) {
          if (isGeminiModelUnavailableError(e)) {
            throw e;
          }
          suggestedChips = fallbackSuggestedChips;
        }

        if (suggestedChips.length < 3) {
          suggestedChips = fallbackSuggestedChips;
        }

        return { replyText, emotion, suggestedChips };
      },
      { candidates: [process.env.GEMINI_CHAT_MODEL] },
    );

    // Step 4: Save to Firestore
    if (db && sessionId) {
      try {
        const sessionRef = db.collection("sessions").doc(sessionId);

        await sessionRef.set(
          {
            lastActive: FieldValue.serverTimestamp(),
            currentStep: step || 1,
            state: state || "",
            firstVoter: firstVoter || false,
          },
          { merge: true },
        );

        const messagesRef = sessionRef.collection("messages");

        // Save user message
        await messagesRef.add({
          role: "user",
          text: message,
          step: step || 1,
          timestamp: FieldValue.serverTimestamp(),
        });

        // Save bot message
        await messagesRef.add({
          role: "model",
          text: replyText,
          emotion: emotion,
          step: step || 1,
          timestamp: FieldValue.serverTimestamp(),
        });
      } catch (e) {
        console.error("Firestore persistence error:", e);
      }
    }

    return res.json({
      reply: replyText,
      emotion,
      suggestedChips: suggestedChips.slice(0, 3),
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
