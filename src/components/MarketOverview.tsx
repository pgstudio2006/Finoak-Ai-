import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { indices, getIndexHistoricalData } from '@/services/marketService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  date: string;
  value: number;
}

const MarketOverview = () => {
  const [activeTab, setActiveTab] = useState<'NIFTY50' | 'SENSEX'>('NIFTY50');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const historyData = await getIndexHistoricalData(activeTab);
        console.log('Fetched data:', historyData);
        setData(historyData);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  const currentValue = indices.find(i => i.id === activeTab)?.value || 0;
  const change = indices.find(i => i.id === activeTab)?.change || 0;
  const changePercent = indices.find(i => i.id === activeTab)?.changePercent || 0;

  console.log('Current data state:', data);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Market Overview</CardTitle>
          <Tabs defaultValue={activeTab} className="w-[400px]">
            <TabsList>
              <TabsTrigger
                value="NIFTY50"
                onClick={() => setActiveTab('NIFTY50')}
              >
                Nifty 50
              </TabsTrigger>
              <TabsTrigger
                value="SENSEX"
                onClick={() => setActiveTab('SENSEX')}
              >
                SENSEX
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">
            {currentValue.toLocaleString()}
            <span className={cn(
              "ml-2 text-sm",
              changePercent > 0 ? "text-green-500" : "text-red-500"
            )}>
              {change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-background border p-2 shadow-lg">
                          <p className="text-sm font-medium">
                            {new Date(data.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Value: {data.value.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
