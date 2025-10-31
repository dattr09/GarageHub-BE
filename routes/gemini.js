const express = require("express");
const { getAIResponse } = require("../services/gemini/client");

const router = express.Router();

// POST /api/gemini/ask
router.post("/ask", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const result = await getAIResponse(prompt);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: "Failed to get AI response" });
    }
});

module.exports = router;
