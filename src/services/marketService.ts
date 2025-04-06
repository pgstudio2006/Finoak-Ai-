import { Stock } from "@/types/stock";

// Demo stock data for Indian market
const stocks: Stock[] = [
  {
    id: "RELIANCE",
    name: "Reliance Industries",
    price: 2825.50,
    change: 35.20,
    changePercent: 1.26,
    volume: 8543267,
    marketCap: 19076342456789,
    pe: 28.75,
    dividend: 0.85,
    sector: "Energy",
    sentiment: 0.78,
  },
  {
    id: "TCS",
    name: "Tata Consultancy Services",
    price: 3645.80,
    change: -42.30,
    changePercent: -1.15,
    volume: 2345678,
    marketCap: 13435673456789,
    pe: 32.45,
    dividend: 1.2,
    sector: "IT",
    sentiment: 0.65,
  },
  {
    id: "HDFCBANK",
    name: "HDFC Bank",
    price: 1678.25,
    change: 23.45,
    changePercent: 1.42,
    volume: 5678934,
    marketCap: 9345678345678,
    pe: 24.5,
    dividend: 1.8,
    sector: "Banking",
    sentiment: 0.82,
  },
  {
    id: "INFY",
    name: "Infosys",
    price: 1425.60,
    change: -18.75,
    changePercent: -1.30,
    volume: 3456789,
    marketCap: 5986734567890,
    pe: 26.8,
    dividend: 1.5,
    sector: "IT",
    sentiment: 0.62,
  },
  {
    id: "ICICIBANK",
    name: "ICICI Bank",
    price: 987.35,
    change: 15.40,
    changePercent: 1.58,
    volume: 4567890,
    marketCap: 6878956789012,
    pe: 21.4,
    dividend: 1.9,
    sector: "Banking",
    sentiment: 0.75,
  },
  {
    id: "HINDUNILVR",
    name: "Hindustan Unilever",
    price: 2456.75,
    change: -28.90,
    changePercent: -1.16,
    volume: 1234567,
    marketCap: 5789234567890,
    pe: 34.2,
    dividend: 2.1,
    sector: "FMCG",
    sentiment: 0.58,
  },
  {
    id: "SBIN",
    name: "State Bank of India",
    price: 645.85,
    change: 8.75,
    changePercent: 1.37,
    volume: 7890123,
    marketCap: 5789012345678,
    pe: 18.6,
    dividend: 2.5,
    sector: "Banking",
    sentiment: 0.72,
  },
  {
    id: "BAJFINANCE",
    name: "Bajaj Finance",
    price: 7234.50,
    change: -124.30,
    changePercent: -1.69,
    volume: 1345678,
    marketCap: 4367890123456,
    pe: 36.8,
    dividend: 0.6,
    sector: "Finance",
    sentiment: 0.56,
  },
  {
    id: "BHARTIARTL",
    name: "Bharti Airtel",
    price: 876.45,
    change: 12.35,
    changePercent: 1.43,
    volume: 3456789,
    marketCap: 4890123456789,
    pe: 22.5,
    dividend: 1.3,
    sector: "Telecom",
    sentiment: 0.68,
  },
  {
    id: "ASIANPAINT",
    name: "Asian Paints",
    price: 3245.80,
    change: -56.70,
    changePercent: -1.72,
    volume: 876543,
    marketCap: 3123456789012,
    pe: 42.1,
    dividend: 1.1,
    sector: "Consumer Goods",
    sentiment: 0.53,
  },
];

// Market indices
export const indices = [
  {
    id: "NIFTY50",
    name: "Nifty 50",
    value: 21345.67,
    change: 165.34,
    changePercent: 0.78,
    previousClose: 21180.33,
  },
  {
    id: "SENSEX",
    name: "SENSEX",
    value: 70123.45,
    change: 542.65,
    changePercent: 0.82,
    previousClose: 69580.80,
  },
];

// Market activity stats
export const marketActivity = {
  advances: 32,
  declines: 18,
  unchanged: 0,
  volume: 1743865432,
  value: 352467890123, // in rupees
  marketBreadth: 1.78, // advances/declines
};

// get Market sentiment
export const getMarketSentiment = async (): Promise<{
  overall: number;
  social: number;
  news: number;
  technical: number;
}> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    overall: 0.72,
    social: 0.68,
    news: 0.75,
    technical: 0.74,
  };
};

// Get all stocks
export const getAllStocks = async (): Promise<Stock[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return stocks;
};

// Get top gainers
export const getTopGainers = async (limit = 5): Promise<Stock[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .filter(stock => stock.changePercent > 0)
    .slice(0, limit);
};

// Get top losers
export const getTopLosers = async (limit = 5): Promise<Stock[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...stocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .filter(stock => stock.changePercent < 0)
    .slice(0, limit);
};

// Search stocks
export const searchStocks = async (query: string): Promise<Stock[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const normalizedQuery = query.toLowerCase();
  return stocks.filter(
    stock => 
      stock.id.toLowerCase().includes(normalizedQuery) || 
      stock.name.toLowerCase().includes(normalizedQuery)
  );
};

// Get stock details by ID
export const getStockById = async (id: string): Promise<Stock | null> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const stock = stocks.find(s => s.id === id);
  return stock || null;
};

// Get stock historical data (mock data for charts)
export const getStockHistoricalData = async (id: string, period = '1M') => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock historical data
  const dataPoints = period === '1W' ? 7 : period === '1M' ? 30 : 90;
  
  // Find the stock to get its current price as a reference
  const stock = stocks.find(s => s.id === id);
  const basePrice = stock ? stock.price : 1000;
  const baseVolume = stock ? stock.volume : 1000000;
  
  const data = [];
  for (let i = dataPoints; i >= 0; i--) {
    // Create a date dataPoints days ago and counting forward
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic price movement
    // Start from basePrice and add some randomness
    const randomChange = (Math.random() - 0.5) * (basePrice * 0.02); // 2% max change
    const price = i === 0 
      ? basePrice 
      : data[dataPoints - i - 1].price + randomChange;
    
    // Generate somewhat realistic volume data
    // Volume tends to be higher on days with bigger price changes
    const volumeMultiplier = 1 + Math.abs(randomChange / basePrice) * 5; // Up to 6x volume on big moves
    const randomVolume = Math.floor(baseVolume * (0.5 + Math.random()) * volumeMultiplier);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: randomVolume
    });
  }
  
  return data;
};

// Get market indices historical data
export const getIndexHistoricalData = async (id: string, period = '1M') => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock historical data
  const dataPoints = period === '1W' ? 7 : period === '1M' ? 30 : 90;
  
  // Find the index to get its current value as a reference
  const index = indices.find(i => i.id === id);
  const baseValue = index ? index.value : 20000;
  
  const data = [];
  for (let i = dataPoints; i >= 0; i--) {
    // Create a date dataPoints days ago and counting forward
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate a somewhat realistic value movement
    const randomChange = (Math.random() - 0.5) * (baseValue * 0.01); // 1% max change
    const value = i === 0 
      ? baseValue 
      : data[dataPoints - i - 1].value + randomChange;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2))
    });
  }
  
  return data;
};
