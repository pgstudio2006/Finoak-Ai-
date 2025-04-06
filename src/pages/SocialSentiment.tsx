import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getSentimentAnalysis } from '@/services/socialSentimentService';
import { TrendingUp, TrendingDown, ArrowLeftRight, Twitter, Github, MessageCircle, Search, AlertCircle, Loader2 } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const SocialSentiment = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'reddit', 'quora']);
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<any>(null);
  
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await getSentimentAnalysis(query, selectedPlatforms);
      setSentimentData(data);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return 'Bullish';
    if (score >= 0.5) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    if (score >= 0.3) return 'Negative';
    return 'Bearish';
  };
  
  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.5) return 'bg-green-400';
    if (score >= 0.4) return 'bg-yellow-400';
    if (score >= 0.3) return 'bg-red-400';
    return 'bg-red-500';
  };
  
  const getSentimentTextColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.5) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    if (score >= 0.3) return 'text-red-400';
    return 'text-red-500';
  };
  
  const getSentimentIcon = (score: number) => {
    if (score >= 0.5) return <TrendingUp className="h-4 w-4" />;
    if (score >= 0.4) return <ArrowLeftRight className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const chartData = sentimentData ? [
    {
      name: 'Twitter',
      score: sentimentData.platforms.twitter?.score || 0,
      positive: sentimentData.platforms.twitter?.distribution.positive || 0,
      neutral: sentimentData.platforms.twitter?.distribution.neutral || 0,
      negative: sentimentData.platforms.twitter?.distribution.negative || 0,
    },
    {
      name: 'Reddit',
      score: sentimentData.platforms.reddit?.score || 0,
      positive: sentimentData.platforms.reddit?.distribution.positive || 0,
      neutral: sentimentData.platforms.reddit?.distribution.neutral || 0,
      negative: sentimentData.platforms.reddit?.distribution.negative || 0,
    },
    {
      name: 'Quora',
      score: sentimentData.platforms.quora?.score || 0,
      positive: sentimentData.platforms.quora?.distribution.positive || 0,
      neutral: sentimentData.platforms.quora?.distribution.neutral || 0,
      negative: sentimentData.platforms.quora?.distribution.negative || 0,
    },
  ] : [];

  const timelineData = sentimentData?.timeline || [];
  
  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Social Media Sentiment Analysis</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analyze Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Term or Ticker</label>
                <Input
                  placeholder="Enter stock, company name, or topic (e.g., AAPL, Tesla, Crypto)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className={cn(
                      "cursor-pointer hover:opacity-80 transition-opacity",
                      selectedPlatforms.includes('twitter') ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => togglePlatform('twitter')}
                  >
                    <Twitter className="h-3 w-3 mr-1" />
                    Twitter/X
                  </Badge>
                  <Badge 
                    className={cn(
                      "cursor-pointer hover:opacity-80 transition-opacity",
                      selectedPlatforms.includes('reddit') ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => togglePlatform('reddit')}
                  >
                    <Github className="h-3 w-3 mr-1" />
                    Reddit
                  </Badge>
                  <Badge 
                    className={cn(
                      "cursor-pointer hover:opacity-80 transition-opacity",
                      selectedPlatforms.includes('quora') ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => togglePlatform('quora')}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Quora
                  </Badge>
                </div>
              </div>
              
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Sentiment'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {loading && (
          <div className="space-y-4">
            <div className="animate-pulse h-64 bg-muted rounded"></div>
            <div className="animate-pulse h-48 bg-muted rounded"></div>
          </div>
        )}
        
        {!loading && sentimentData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Sentiment Analysis for "{query}"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall Sentiment</span>
                    <span className={`text-sm font-medium flex items-center gap-1 ${getSentimentTextColor(sentimentData.overall)}`}>
                      {getSentimentIcon(sentimentData.overall)}
                      {getSentimentLabel(sentimentData.overall)} ({(sentimentData.overall * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    value={sentimentData.overall * 100} 
                    className="h-2" 
                    indicatorClassName={getSentimentColor(sentimentData.overall)}
                  />
                </div>
                
                <Tabs defaultValue="sentiment-distribution">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="sentiment-distribution">Sentiment Distribution</TabsTrigger>
                    <TabsTrigger value="sentiment-timeline">Sentiment Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sentiment-distribution" className="pt-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis 
                            dataKey="name"
                            {...{} as any}
                          />
                          <YAxis 
                            tickFormatter={(value) => `${value * 100}%`}
                            {...{} as any}
                          />
                          <Tooltip 
                            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                            contentStyle={{ borderRadius: '8px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="positive" 
                            stackId="1"
                            stroke="#10B981" 
                            fill="url(#positiveGradient)"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="neutral" 
                            stackId="1"
                            stroke="#F59E0B" 
                            fill="url(#neutralGradient)"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="negative" 
                            stackId="1"
                            stroke="#EF4444" 
                            fill="url(#negativeGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sentiment-timeline" className="pt-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString()}
                            {...{} as any}
                          />
                          <YAxis
                            domain={[0, 1]}
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                            {...{} as any}
                          />
                          <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="twitter" 
                            name="Twitter" 
                            stroke="#1DA1F2" 
                            strokeWidth={2} 
                            dot={true} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="reddit" 
                            name="Reddit" 
                            stroke="#FF4500" 
                            strokeWidth={2} 
                            dot={true} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="quora" 
                            name="Quora" 
                            stroke="#A82400" 
                            strokeWidth={2} 
                            dot={true} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(sentimentData.platforms).map(([platform, data]: [string, any]) => (
                <Card key={platform}>
                  <CardHeader className="pb-2">
                    <CardTitle className="capitalize">{platform} Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Sentiment Score</span>
                          <span className={`text-sm font-medium ${getSentimentTextColor(data.score)}`}>
                            {getSentimentLabel(data.score)}
                          </span>
                        </div>
                        <Progress 
                          value={data.score * 100} 
                          className="h-2" 
                          indicatorClassName={getSentimentColor(data.score)}
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Distribution</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-green-500 font-medium">{(data.distribution.positive * 100).toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">Positive</div>
                          </div>
                          <div>
                            <div className="text-yellow-500 font-medium">{(data.distribution.neutral * 100).toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">Neutral</div>
                          </div>
                          <div>
                            <div className="text-red-500 font-medium">{(data.distribution.negative * 100).toFixed(0)}%</div>
                            <div className="text-xs text-muted-foreground">Negative</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Key Topics</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.topics.map((topic: string, i: number) => (
                            <Badge 
                              key={i}
                              className="bg-secondary text-secondary-foreground"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SocialSentiment;
