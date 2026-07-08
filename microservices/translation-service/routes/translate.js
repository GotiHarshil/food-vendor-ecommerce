const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Gemini translation ─────────────────────────────────────
async function translateWithGemini(text) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const safeText = text.slice(0, 500).replace(/["""''']/g, " ");
  const prompt = `You are a translator. Translate ONLY the customer food order note below from English to Hindi. Output ONLY the Hindi translation, nothing else.\n---BEGIN NOTE---\n${safeText}\n---END NOTE---`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── MyMemory fallback ──────────────────────────────────────
async function translateWithMyMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(`MyMemory error: ${data.responseDetails}`);
  return data.responseData.translatedText;
}

// ── POST /translate ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "text is required" });
    }

    let translated;
    let source = "gemini";

    // Try Gemini first, fall back to MyMemory
    try {
      translated = await translateWithGemini(text);
      console.log("[Translate] Gemini success");
    } catch (geminiErr) {
      console.warn("[Translate] Gemini failed, using MyMemory fallback:", geminiErr.message.slice(0, 80));
      translated = await translateWithMyMemory(text);
      source = "mymemory";
      console.log("[Translate] MyMemory success");
    }

    res.json({ success: true, translated, source });
  } catch (err) {
    console.error("[Translate] All methods failed:", err.message);
    res.status(500).json({ error: "Translation failed. Please try again." });
  }
});

module.exports = router;
