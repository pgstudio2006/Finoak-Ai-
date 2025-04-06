// API configuration from environment variables
export const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
export const API_URL = import.meta.env.VITE_OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
export const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-pro";

// Base system prompt for financial assistant
const BASE_SYSTEM_PROMPT = `
You are FinoakAI, a professional financial analyst specializing in the Indian stock market.
IMPORTANT: DO NOT USE ANY MARKDOWN SYMBOLS OR FORMATTING. Use only plain text with emojis and bullet points.

STRICT FORMATTING RULES:
1. NEVER use these symbols: *, #, -, _, [], (), or any other markdown
2. NEVER add disclaimers or warnings
3. NEVER use bold or italic formatting
4. Use ONLY emojis and bullet points (•) for formatting

USE THIS EXACT FORMAT:

📈 [Company Name] Overview
One-line company description without any special characters

📊 Current Market Status
• Status: [plain text]
• Market Share: [plain text]
• Key Numbers: [plain text]

💰 Financial Details
• Revenue: [plain text]
• Growth: [plain text]
• Outlook: [plain text]

🎯 Trading Plan
• Buy Price: ₹[number]
• Target: ₹[number]
• Stop Loss: ₹[number]

💡 Quick Points
• [Point 1 in plain text]
• [Point 2 in plain text]
• [Point 3 in plain text]

IMPORTANT REMINDERS:
- Use plain text only
- No special characters or formatting
- No markdown symbols
- No disclaimers
- Keep it clean and simple
- Use only bullet points (•) and emojis
`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResponse = {
  text: string;
  isLoading: boolean;
  error: string | null;
};

// Clean up response text by removing markdown symbols
const cleanupResponse = (text: string): string => {
  return text
    .replace(/#+\s/g, '') // Remove hashtags
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/_{2,}/g, '') // Remove underscores
    .replace(/\[|\]/g, '') // Remove square brackets
    .replace(/\(|\)/g, '') // Remove parentheses
    .replace(/^[-•]\s/gm, '• ') // Standardize bullet points
    .replace(/###/g, '') // Remove heading markers
    .replace(/##/g, '') // Remove subheading markers
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra newlines
    .trim();
};

export const chatWithAssistant = async (messages: Message[]): Promise<string> => {
  try {
    // Add system prompt to the beginning if not already present
    const chatMessages = messages[0]?.role === "system" 
      ? messages 
      : [{ role: "system", content: BASE_SYSTEM_PROMPT }, ...messages];
    
    console.log('Sending request to OpenRouter:', {
      url: API_URL,
      model: MODEL,
      messages: chatMessages
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://finoak-ai-insights.vercel.app/",
        "X-Title": "Finoak AI Insights"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1000,
        stop: null,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Chat API Error Response:", errorData);
      throw new Error(errorData.error?.message || `Failed to chat with assistant: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from API");
    }
    
    // Clean up the response before returning
    return cleanupResponse(data.choices[0].message.content);
  } catch (error) {
    console.error("Error chatting with assistant:", error);
    throw error;
  }
};

// Analyze sentiment for a stock
export const analyzeSentiment = async (stockSymbol: string, stockName: string): Promise<number> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://finoak-ai-insights.vercel.app/",
        "X-Title": "Finoak AI Insights"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a professional market analyst. For ${stockName} (${stockSymbol}), provide a sentiment score from 0.0 (bearish) to 1.0 (bullish). Return only the number without any additional text or formatting.`
          },
          {
            role: "user",
            content: `Sentiment score for ${stockName}?`
          }
        ],
        temperature: 0.2,
        max_tokens: 50,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze sentiment");
    }

    const data = await response.json();
    const textResponse = cleanupResponse(data.choices[0].message.content.trim());
    
    // Try to extract a number between 0 and 1 from the response
    const match = textResponse.match(/0?\.\d+/);
    if (match) {
      return parseFloat(match[0]);
    }
    
    // Fallback to a random sentiment
    return 0.5 + (Math.random() * 0.4 - 0.2);
    
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return 0.5 + (Math.random() * 0.4 - 0.2);
  }
};

// Get price prediction
export const getPricePrediction = async (stockSymbol: string, stockName: string, currentPrice: number): Promise<{ prediction: string, priceTarget: number }> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://finoak-ai-insights.vercel.app/",
        "X-Title": "Finoak AI Insights"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a professional market analyst. For ${stockName} (${stockSymbol}) at ₹${currentPrice}, provide a price prediction in clean JSON format without any additional text: {"prediction": "bullish/bearish", "priceTarget": number}`
          },
          {
            role: "user",
            content: `Price target for ${stockName}?`
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get price prediction");
    }

    const data = await response.json();
    const textResponse = cleanupResponse(data.choices[0].message.content.trim());
    
    try {
      // Try to parse JSON from the response
      const match = textResponse.match(/\{.*\}/s);
      if (match) {
        const json = JSON.parse(match[0]);
        if (json.prediction && json.priceTarget) {
          return {
            prediction: json.prediction,
            priceTarget: parseFloat(json.priceTarget)
          };
        }
      }
    } catch (e) {
      console.error("Error parsing prediction JSON:", e);
    }
    
    // Fallback prediction
    const randomChange = currentPrice * (Math.random() * 0.1 - 0.05);
    const priceTarget = parseFloat((currentPrice + randomChange).toFixed(2));
    const prediction = randomChange > 0 ? "bullish" : randomChange < 0 ? "bearish" : "neutral";
    
    return { prediction, priceTarget };
    
  } catch (error) {
    console.error("Error getting price prediction:", error);
    // Fallback prediction
    const randomChange = currentPrice * (Math.random() * 0.1 - 0.05);
    const priceTarget = parseFloat((currentPrice + randomChange).toFixed(2));
    const prediction = randomChange > 0 ? "bullish" : randomChange < 0 ? "bearish" : "neutral";
    
    return { prediction, priceTarget };
  }
};
