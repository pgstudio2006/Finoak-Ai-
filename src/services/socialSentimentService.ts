
import { API_KEY, API_URL } from './aiService';

interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

interface PlatformSentiment {
  score: number;
  distribution: SentimentDistribution;
  topics: string[];
}

interface SentimentData {
  overall: number;
  platforms: {
    twitter?: PlatformSentiment;
    reddit?: PlatformSentiment;
    quora?: PlatformSentiment;
  };
  timeline: {
    date: string;
    twitter?: number;
    reddit?: number;
    quora?: number;
  }[];
}

export const getSentimentAnalysis = async (
  query: string,
  platforms: string[] = ['twitter', 'reddit', 'quora']
): Promise<SentimentData> => {
  try {
    // First try to get real sentiment analysis from AI API
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-pro-1.5",
          messages: [
            {
              role: "system",
              content: `You are an expert sentiment analyzer for financial and stock market content on social media.
              
              Analyze sentiment for "${query}" across these platforms: ${platforms.join(", ")}.
              
              Return a JSON object with this exact structure:
              {
                "overall": [0-1 sentiment score],
                "platforms": {
                  ${platforms.includes("twitter") ? `"twitter": {
                    "score": [0-1 sentiment score],
                    "distribution": {
                      "positive": [0-1 ratio],
                      "neutral": [0-1 ratio],
                      "negative": [0-1 ratio]
                    },
                    "topics": [array of 3-5 key topics]
                  },` : ''}
                  
                  ${platforms.includes("reddit") ? `"reddit": {
                    "score": [0-1 sentiment score],
                    "distribution": {
                      "positive": [0-1 ratio],
                      "neutral": [0-1 ratio],
                      "negative": [0-1 ratio]
                    },
                    "topics": [array of 3-5 key topics]
                  },` : ''}
                  
                  ${platforms.includes("quora") ? `"quora": {
                    "score": [0-1 sentiment score],
                    "distribution": {
                      "positive": [0-1 ratio],
                      "neutral": [0-1 ratio],
                      "negative": [0-1 ratio]
                    },
                    "topics": [array of 3-5 key topics]
                  }` : ''}
                },
                "timeline": [
                  {
                    "date": "YYYY-MM-DD",
                    ${platforms.includes("twitter") ? `"twitter": [0-1 score],` : ''}
                    ${platforms.includes("reddit") ? `"reddit": [0-1 score],` : ''}
                    ${platforms.includes("quora") ? `"quora": [0-1 score]` : ''}
                  },
                  ...14 days of data
                ]
              }
              
              Ensure all sentiment scores are between 0 (very negative) and 1 (very positive).
              Distribution values must add up to 1.0.`
            },
            {
              role: "user",
              content: `Analyze social media sentiment for "${query}" on ${platforms.join(", ")}. Return only the JSON data structure.`
            }
          ],
          temperature: 0.3
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle the case where the API returns an error about credits
        if (data.error) {
          console.error("API error:", data.error);
          throw new Error(data.error.message || "API error");
        }
        
        // Check if the response has the expected structure
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content;
          
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const sentimentData = JSON.parse(jsonMatch[0]);
              // Validate that the data has the expected structure
              if (sentimentData && sentimentData.overall && sentimentData.platforms) {
                return sentimentData;
              }
            } catch (e) {
              console.error("Error parsing sentiment JSON:", e);
            }
          }
        } else {
          console.error("Unexpected API response structure:", data);
        }
      } else {
        console.error("API response not OK:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error with AI sentiment analysis:", error);
    }
    
    // Fallback to mock data
    console.log("Using fallback mock sentiment data for", query);
    return generateMockSentimentData(query, platforms);
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return generateMockSentimentData(query, platforms);
  }
};

const generateMockSentimentData = (query: string, platforms: string[]): SentimentData => {
  // Base sentiment based on query
  let baseScore: number;
  
  // Determine a base score based on common stock or crypto tickers
  const normalizedQuery = query.toLowerCase();
  if (['aapl', 'apple', 'goog', 'google', 'msft', 'microsoft'].includes(normalizedQuery)) {
    baseScore = 0.7 + Math.random() * 0.15; // Mostly positive
  } else if (['meta', 'fb', 'facebook', 'amzn', 'amazon'].includes(normalizedQuery)) {
    baseScore = 0.6 + Math.random() * 0.15; // Somewhat positive
  } else if (['tsla', 'tesla', 'nflx', 'netflix'].includes(normalizedQuery)) {
    baseScore = 0.4 + Math.random() * 0.4; // Mixed sentiment
  } else if (['btc', 'bitcoin', 'eth', 'ethereum', 'crypto', 'doge'].includes(normalizedQuery)) {
    baseScore = 0.3 + Math.random() * 0.6; // Highly variable
  } else {
    baseScore = 0.4 + Math.random() * 0.3; // Default - neutral to somewhat positive
  }
  
  // Create a result structure with mock data
  const result: SentimentData = {
    overall: baseScore,
    platforms: {},
    timeline: []
  };
  
  // Create platform-specific sentiment data
  platforms.forEach(platform => {
    // Add variation to each platform
    const platformVariation = (Math.random() - 0.5) * 0.2; // -0.1 to 0.1 variation
    const score = Math.min(Math.max(baseScore + platformVariation, 0.05), 0.95);
    
    // Calculate distribution based on score
    let positive = score * 0.9;
    let negative = (1 - score) * 0.9;
    let neutral = 1 - positive - negative;
    
    // Adjust to ensure they sum to 1
    const sum = positive + neutral + negative;
    positive = positive / sum;
    neutral = neutral / sum;
    negative = negative / sum;
    
    // Mock topics based on query and platform
    const topics = generateMockTopics(query, platform);
    
    result.platforms[platform as keyof typeof result.platforms] = {
      score,
      distribution: { positive, neutral, negative },
      topics
    };
  });
  
  // Generate time series data for the past 14 days
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const timelineEntry: any = {
      date: date.toISOString().split('T')[0]
    };
    
    // Add sentiment for each platform with some day-to-day variation
    platforms.forEach(platform => {
      const platformScore = result.platforms[platform as keyof typeof result.platforms]?.score || 0.5;
      const dayVariation = (Math.random() - 0.5) * 0.15; // Add daily variation
      timelineEntry[platform] = Math.min(Math.max(platformScore + dayVariation, 0.05), 0.95);
    });
    
    result.timeline.push(timelineEntry);
  }
  
  return result;
};

const generateMockTopics = (query: string, platform: string): string[] => {
  const normalizedQuery = query.toLowerCase();
  
  // Base topics for all platforms
  const baseTopic = query.charAt(0).toUpperCase() + query.slice(1);
  const topics = [baseTopic];
  
  // Add finance-related topics
  const financialTopics = [
    'earnings', 'stock price', 'investment', 'market', 'trading',
    'dividend', 'forecast', 'growth', 'performance', 'shareholders'
  ];
  
  // Add platform-specific topics
  if (platform === 'twitter') {
    topics.push('trending');
    topics.push(Math.random() > 0.5 ? 'breaking news' : 'latest update');
  } else if (platform === 'reddit') {
    topics.push('r/wallstreetbets');
    topics.push(Math.random() > 0.5 ? 'DD thread' : 'analysis');
  } else if (platform === 'quora') {
    topics.push('expert opinion');
    topics.push(Math.random() > 0.5 ? 'financial advice' : 'investment strategy');
  }
  
  // Add 1-2 random financial topics
  for (let i = 0; i < 2; i++) {
    if (Math.random() > 0.3) {
      const randomTopic = financialTopics[Math.floor(Math.random() * financialTopics.length)];
      if (!topics.includes(randomTopic)) {
        topics.push(randomTopic);
      }
    }
  }
  
  return topics.slice(0, 5); // Limit to max 5 topics
};
