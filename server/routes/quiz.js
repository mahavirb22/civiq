import express from 'express';
import { body, validationResult } from 'express-validator';
import { withGeminiModel } from "../lib/gemini.js";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post(
  '/generate',
  [
    body('state').optional().isString().trim().escape().isLength({ max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
    const { state = "India" } = req.body;

    const prompt = `Generate exactly 10 multiple choice questions about Indian election process,
voting rights, and civic duties relevant to ${state} state. Each question must be 
practical and educational. Format as JSON array only, no markdown:
[{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "explanation": "string (1 sentence why this is correct)"
}]`;

    const responseText = await withGeminiModel(
      async (model) => {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.5 }
        });

        return result.response.text();
      },
      { candidates: [process.env.GEMINI_QUIZ_MODEL] },
    );

    let questions = [];

    // Extract JSON array robustly
    const match = responseText.match(/\[.*\]/s);
    if (match) {
      questions = JSON.parse(match[0]);
    } else {
      questions = JSON.parse(responseText);
    }
    
    return res.json(questions);

  } catch (err) {
    console.error("Quiz API Error:", err);
    // Fallback set
    return res.json([
      {
        question: "What is the minimum voting age in India?",
        options: ["18 years", "21 years", "25 years", "16 years"],
        correctIndex: 0,
        explanation: "The 61st Amendment Act reduced the voting age from 21 to 18 years in 1989."
      },
      {
        question: "What does EPIC stand for in the context of elections?",
        options: ["Election Photo Identity Card", "Electoral Process Independent Commission", "Electronic Polling Information Center", "Electoral Paper Identity Confirmation"],
        correctIndex: 0,
        explanation: "EPIC is your official Voter ID card issued by the Election Commission of India."
      },
      {
        question: "What is the VVPAT?",
        options: ["Voter Verified Paper Audit Trail", "Voting Validation Process And Tracking", "Visual Vote Print And Tally", "Voter Validation Protocol Administrative Tool"],
        correctIndex: 0,
        explanation: "VVPAT is a system that prints a paper slip allowing voters to verify their vote."
      },
      {
        question: "Can an NRI (Non-Resident Indian) vote in Indian elections?",
        options: ["Yes, if they register as an NRI voter", "No, NRIs cannot vote", "Only if they pay dual taxes", "Yes, through an online portal automatically"],
        correctIndex: 0,
        explanation: "NRIs holding a valid Indian passport can vote by registering as overseas electors."
      },
      {
        question: "What does NOTA stand for on the EVM?",
        options: ["None of the Above", "No Other Transferable Action", "National Objection To All", "New Option To Alter"],
        correctIndex: 0,
        explanation: "NOTA allows voters to officially register their rejection of all contesting candidates."
      }
    ]);
  }
});

export default router;
