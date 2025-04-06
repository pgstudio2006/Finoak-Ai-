import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStockById, getStockHistoricalData } from '@/services/marketService';
import { analyzeSentiment, getPricePrediction } from '@/services/aiService';
import { getSentimentAnalysis } from '@/services/socialSentimentService';
import { Stock } from '@/types/stock';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowLeftRight, AlertTriangle, Check, Twitter, Github, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

const StockDetail = () => {
  const { stockId } = useParams<{ stockId: string }>();
  const { theme } = useTheme();
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [period, setPeriod] = useState('1M');
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [socialSentiment, setSocialSentiment] = useState<any>(null);
  const [socialSentimentLoading, setSocialSentimentLoading] = useState(true);
  const [prediction, setPrediction] = useState<{ prediction: string, priceTarget: number } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("overview");

  useEffect(() => {
    document.title = `${stockId} - Finoak AI`;
    
    const fetchStockData = async () => {
      if (!stockId) return;
      
      setLoading(true);
      try {
        const stockData = await getStockById(stockId);
        if (stockData) {
          setStock(stockData);
          document.title = `${stockData.name} (${stockId}) - Finoak AI`;
        }
        
        const histData = await getStockHistoricalData(stockId, period);
        setChartData(histData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [stockId, period]);

  useEffect(() => {
    const performAIAnalysis = async () => {
      if (!stock) return;
      
      setAnalysisLoading(true);
      setSocialSentimentLoading(true);
      
      try {
        const [sentimentScore, pricePrediction] = await Promise.all([
          analyzeSentiment(stock.id, stock.name),
          getPricePrediction(stock.id, stock.name, stock.price)
        ]);
        
        setSentiment(sentimentScore);
        setPrediction(pricePrediction);
        
        const socialData = await getSentimentAnalysis(`${stock.name} ${stock.id}`, ['twitter', 'reddit', 'quora']);
        setSocialSentiment(socialData);
      } catch (error) {
        console.error('Error performing AI analysis:', error);
      } finally {
        setAnalysisLoading(false);
        setSocialSentimentLoading(false);
      }
    };

    if (stock) {
      performAIAnalysis();
    }
  }, [stock]);

  if (loading && !stock) {
    return (
      <div className={`min-h-screen ${theme}`}>
        <Navbar />
        <main className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
              <div className="h-32 bg-muted rounded w-full max-w-md"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className={`min-h-screen ${theme}`}>
        <Navbar />
        <main className="container py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Stock Not Found</h1>
            <p>The requested stock could not be found.</p>
          </div>
        </main>
      </div>
    );
  }

  const isPositive = stock.change > 0;

  const getSentimentColor = (value: number) => {
    if (value >= 0.7) return 'bg-finoak-green';
    if (value >= 0.4) return 'bg-finoak-yellow';
    return 'bg-finoak-red';
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 0.7) return 'Bullish';
    if (value >= 0.4) return 'Neutral';
    return 'Bearish';
  };

  const getSentimentTextColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.5) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    if (score >= 0.3) return 'text-red-400';
    return 'text-red-500';
  };

  const getRiskLevel = () => {
    const volatilityFactor = Math.abs(stock.changePercent) > 2 ? 1 : 0;
    const sectorFactor = ['Banking', 'IT', 'FMCG'].includes(stock.sector) ? 0 : 0.5;
    const sentimentFactor = sentiment && sentiment < 0.4 ? 1 : sentiment && sentiment < 0.7 ? 0.5 : 0;
    
    const riskScore = volatilityFactor + sectorFactor + sentimentFactor;
    
    if (riskScore >= 1.5) return { level: 'High', color: 'text-finoak-red' };
    if (riskScore >= 0.7) return { level: 'Medium', color: 'text-finoak-yellow' };
    return { level: 'Low', color: 'text-finoak-green' };
  };

  const risk = getRiskLevel();

  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container py-6">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{stock.name} ({stock.id})</h1>
              <p className="text-muted-foreground">{stock.sector}</p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div className={`flex items-center justify-end ${isPositive ? 'gain-text' : 'loss-text'}`}>
                {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                <span>
                  {isPositive ? '+' : ''}{stock.change.toLocaleString('en-IN', { maximumFractionDigits: 2 })} 
                  ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Price Chart</CardTitle>
                  <Tabs defaultValue="1M" value={period} onValueChange={setPeriod} className="w-[200px]">
                    <TabsList>
                      <TabsTrigger value="1W">1W</TabsTrigger>
                      <TabsTrigger value="1M">1M</TabsTrigger>
                      <TabsTrigger value="3M">3M</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="chart-container" style={{ height: '400px', width: '100%' }}>
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          height={30}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.getDate().toString();
                          }}
                        />
                        <YAxis 
                          yAxisId="price"
                          orientation="left"
                          width={60}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.toLocaleString('en-IN')}
                          domain={['auto', 'auto']}
                        />
                        <YAxis 
                          yAxisId="volume"
                          orientation="right"
                          width={60}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'}
                        />
                        <Tooltip 
                          formatter={(value: number, name: string) => {
                            if (name === 'Price') {
                              return [`₹${value.toLocaleString('en-IN')}`, name];
                            }
                            return [value.toLocaleString('en-IN'), 'Volume'];
                          }}
                          labelFormatter={(date) => {
                            return new Date(date).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="volume" 
                          yAxisId="volume"
                          fill={theme === 'dark' ? '#374151' : '#E5E7EB'}
                          opacity={0.5}
                          name="Volume"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          yAxisId="price"
                          stroke={isPositive ? "#10B981" : "#EF4444"} 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                          name="Price"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="dashboard-card mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Stock Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Market Cap</p>
                      <p className="font-medium">₹{(stock.marketCap / 10000000000).toFixed(2)} Cr</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">P/E Ratio</p>
                      <p className="font-medium">{stock.pe.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{stock.volume.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dividend Yield</p>
                      <p className="font-medium">{stock.dividend.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse h-6 bg-muted rounded"></div>
                    <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
                    <div className="animate-pulse h-4 bg-muted rounded"></div>
                    <div className="animate-pulse h-6 bg-muted rounded w-1/2"></div>
                  </div>
                ) : (
                  <div>
                    <Tabs value={activeAnalysisTab} onValueChange={setActiveAnalysisTab} className="mb-4">
                      <TabsList className="w-full mb-4">
                        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                        <TabsTrigger value="social" className="flex-1">Social</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Sentiment Score</span>
                            <span className="text-sm font-medium">
                              {sentiment !== null ? getSentimentLabel(sentiment) : 'N/A'}
                            </span>
                          </div>
                          <Progress 
                            value={sentiment !== null ? sentiment * 100 : 0} 
                            className="h-2" 
                            indicatorClassName={sentiment !== null ? getSentimentColor(sentiment) : ''}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Price Prediction</p>
                            <p className={`font-medium ${
                              prediction?.prediction === 'bullish' ? 'text-finoak-green' :
                              prediction?.prediction === 'bearish' ? 'text-finoak-red' : ''
                            }`}>
                              {prediction?.prediction === 'bullish' && <TrendingUp className="inline mr-1 h-4 w-4" />}
                              {prediction?.prediction === 'bearish' && <TrendingDown className="inline mr-1 h-4 w-4" />}
                              {prediction?.prediction === 'neutral' && <ArrowLeftRight className="inline mr-1 h-4 w-4" />}
                              {prediction ? prediction.prediction.charAt(0).toUpperCase() + prediction.prediction.slice(1) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Target Price</p>
                            <p className="font-medium">
                              ₹{prediction ? prediction.priceTarget.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <p className={`font-medium flex items-center ${risk.color}`}>
                            {risk.level === 'High' && <AlertTriangle className="inline mr-1 h-4 w-4" />}
                            {risk.level === 'Medium' && <ArrowLeftRight className="inline mr-1 h-4 w-4" />}
                            {risk.level === 'Low' && <Check className="inline mr-1 h-4 w-4" />}
                            {risk.level}
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="social">
                        {socialSentimentLoading ? (
                          <div className="space-y-4">
                            <div className="animate-pulse h-4 bg-muted rounded"></div>
                            <div className="animate-pulse h-6 bg-muted rounded"></div>
                          </div>
                        ) : socialSentiment ? (
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Social Sentiment</span>
                                <span className={`text-sm font-medium ${getSentimentTextColor(socialSentiment.overall)}`}>
                                  {getSentimentLabel(socialSentiment.overall)}
                                </span>
                              </div>
                              <Progress 
                                value={socialSentiment.overall * 100} 
                                className="h-2" 
                                indicatorClassName={getSentimentColor(socialSentiment.overall)}
                              />
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Platforms</p>
                              <div className="space-y-2">
                                {socialSentiment.platforms.twitter && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Twitter className="h-3 w-3 mr-1" />
                                      <span className="text-sm">Twitter/X</span>
                                    </div>
                                    <Badge
                                      variant="default"
                                      className={getSentimentColor(socialSentiment.platforms.twitter.score)}
                                    >
                                      {(socialSentiment.platforms.twitter.score * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                )}
                                
                                {socialSentiment.platforms.reddit && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Github className="h-3 w-3 mr-1" />
                                      <span className="text-sm">Reddit</span>
                                    </div>
                                    <Badge
                                      variant="default"
                                      className={getSentimentColor(socialSentiment.platforms.reddit.score)}
                                    >
                                      {(socialSentiment.platforms.reddit.score * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                )}
                                
                                {socialSentiment.platforms.quora && (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      <span className="text-sm">Quora</span>
                                    </div>
                                    <Badge
                                      variant="default"
                                      className={getSentimentColor(socialSentiment.platforms.quora.score)}
                                    >
                                      {(socialSentiment.platforms.quora.score * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Key Topics</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.values(socialSentiment.platforms)
                                  .flatMap((platform: any) => platform.topics || [])
                                  .slice(0, 5)
                                  .map((topic: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="default"
                                      className="text-muted-foreground"
                                    >
                                      {topic}
                                    </Badge>
                                  ))
                                }
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p>No social sentiment data available.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
