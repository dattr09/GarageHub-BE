const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo với API key từ env và version mới
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: "v1", // Chỉ định version API
});

async function generateChatResponse(prompt) {
  try {
    console.log("Initializing Gemini chat with prompt:", prompt);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY không được cấu hình");
    }

    // Sử dụng chat model thay vì generateContent trực tiếp
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const enhancedPrompt = `Bạn là trợ lý AI của GarageHub, chuyên về sửa chữa và bảo dưỡng xe máy. Hãy trả lời bằng tiếng Việt: ${prompt}`;

    console.log("Sending request to Gemini API...");
    const result = await chat.sendMessage(enhancedPrompt);
    console.log("Received response from Gemini API");

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Lỗi Gemini API: ${error.message || "Không xác định"}`);
  }
}

module.exports = { generateChatResponse };
