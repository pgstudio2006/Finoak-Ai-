
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getMarketSentiment } from '@/services/marketService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSentimentAnalysis } from '@/services/socialSentimentService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MarketSentiment: React.FC = () => {
  const [sentimentData, setSentimentData] = useState({
    overall: 0,
    social: 0,
    news: 0,
    technical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [socialTimelineData, setSocialTimelineData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch regular market sentiment
        const marketData = await getMarketSentiment();
        
        // Fetch social sentiment for "market"
        const socialData = await getSentimentAnalysis("market", ['twitter', 'reddit']);
        
        setSentimentData({
          ...marketData,
          social: socialData.overall, // Update with real social sentiment
        });
        
        setSocialTimelineData(socialData.timeline);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Converts sentiment score to a percentage for the progress bar
  const sentimentToPercent = (value: number) => Math.round(value * 100);
  
  // Determines color based on sentiment score
  const getSentimentColor = (value: number) => {
    if (value >= 0.7) return 'bg-finoak-green';
    if (value >= 0.4) return 'bg-finoak-yellow';
    return 'bg-finoak-red';
  };
  
  // Determines sentiment label
  const getSentimentLabel = (value: number) => {
    if (value >= 0.7) return 'Bullish';
    if (value >= 0.4) return 'Neutral';
    return 'Bearish';
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle>Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6 py-2">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-muted animate-pulse h-4 w-20 rounded"></div>
                <div className="bg-muted animate-pulse h-4 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trend">Trend</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 py-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Overall Market</span>
                    <span className="text-sm font-medium">{getSentimentLabel(sentimentData.overall)}</span>
                  </div>
                  <Progress 
                    value={sentimentToPercent(sentimentData.overall)} 
                    className="h-2" 
                    indicatorClassName={getSentimentColor(sentimentData.overall)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Social Media</span>
                    <span className="text-sm font-medium">{getSentimentLabel(sentimentData.social)}</span>
                  </div>
                  <Progress 
                    value={sentimentToPercent(sentimentData.social)} 
                    className="h-2" 
                    indicatorClassName={getSentimentColor(sentimentData.social)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">News Analysis</span>
                    <span className="text-sm font-medium">{getSentimentLabel(sentimentData.news)}</span>
                  </div>
                  <Progress 
                    value={sentimentToPercent(sentimentData.news)} 
                    className="h-2" 
                    indicatorClassName={getSentimentColor(sentimentData.news)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Technical Signals</span>
                    <span className="text-sm font-medium">{getSentimentLabel(sentimentData.technical)}</span>
                  </div>
                  <Progress 
                    value={sentimentToPercent(sentimentData.technical)} 
                    className="h-2" 
                    indicatorClassName={getSentimentColor(sentimentData.technical)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="trend">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={socialTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth()+1}`;
                        }} 
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Sentiment']}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Line type="monotone" dataKey="twitter" name="Twitter" stroke="#1DA1F2" />
                      <Line type="monotone" dataKey="reddit" name="Reddit" stroke="#FF4500" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketSentiment;
