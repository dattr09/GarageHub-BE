const { GoogleGenAI } = require("@google/genai");
const { GOOGLE_API_KEY } = require("../../config/envVars");

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

// Hàm loại bỏ các dấu ** trong văn bản
const cleanText = (text) =>
    text
        // Xóa các ký tự markdown phổ biến: *, _, `, ~, #, >, -, [, ], (, ), !, v.v. (trừ dấu !, ", ...)
        .replace(/[*_`~#>\-\[\]\(\)]/g, "")
        // Giữ lại các dấu câu: . , ; : ? ! " … (dấu ba chấm unicode) và xuống dòng
        .replace(/[^\p{L}\p{N}\s.,;:?!'"“”…\n\r-]/gu, "")
        // Gom nhiều dấu chấm liên tiếp thành dấu ba chấm
        .replace(/\.{3,}/g, "…")
        // Xóa khoảng trắng thừa ở đầu/cuối và nhiều khoảng trắng liên tiếp
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