const { GoogleGenAI } = require("@google/genai");
const { GOOGLE_API_KEY } = require("../../config/envVars");

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

const cleanText = (text) =>
    text
        .replace(/[*_`~#>\-\[\]\(\)]/g, "")
        .replace(/[^\p{L}\p{N}\s.,;:?!'"“”…\n\r-]/gu, "")
        .replace(/\.{3,}/g, "…")
        .replace(/\s{2,}/g, " ")
        .trim();

const getAIResponse = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        });

        return cleanText(response.text || "No response from AI");
    } catch (error) {
        console.error("Error getting AI response:", error);
        throw error;
    }
};

module.exports = { getAIResponse };