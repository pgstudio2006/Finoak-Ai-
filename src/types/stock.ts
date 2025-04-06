
export interface Stock {
  id: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  sector: string;
  sentiment: number;
}

export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

export interface ChartData {
  date: string;
  price?: number;
  value?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StockAnalysis {
  sentiment: number;
  prediction: string;
  priceTarget: number;
  riskLevel: "Low" | "Medium" | "High";
  keyFactors: string[];
}
