import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    // Sanitize: strip basic markdown formatting (*, `, _) and truncate
    let sanitizedText = text.replace(/[*_`]/g, '').substring(0, 500);

    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.TTS_API_KEY}`;
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: sanitizedText },
        voice: { languageCode: "en-IN", name: "en-IN-Wavenet-D", ssmlGender: "MALE" },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.9, pitch: -1.0 }
      })
    });

    if (!response.ok) {
      throw new Error("TTS external fail.");
    }

    const data = await response.json();
    
    if (data.audioContent) {
      return res.json({ audioContent: data.audioContent });
    } else {
      return res.status(500).json({ error: "TTS unavailable" });
    }

  } catch (err) {
    console.error("TTS Endpoint Error:", err);
    return res.status(500).json({ error: "TTS unavailable" });
  }
});

export default router;
