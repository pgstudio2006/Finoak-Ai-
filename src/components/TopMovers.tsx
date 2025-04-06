
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getTopGainers, getTopLosers } from '@/services/marketService';
import { Stock } from '@/types/stock';
import { useNavigate } from 'react-router-dom';

const TopMovers: React.FC = () => {
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gainersData, losersData] = await Promise.all([
          getTopGainers(),
          getTopLosers()
        ]);
        setGainers(gainersData);
        setLosers(losersData);
      } catch (error) {
        console.error("Error fetching top movers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStockClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-2">
        <CardTitle>Top Movers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="gainers" className="flex items-center justify-center">
              <TrendingUp className="mr-1 h-4 w-4" />
              Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center justify-center">
              <TrendingDown className="mr-1 h-4 w-4" />
              Losers
            </TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-muted animate-pulse h-12 rounded-md"></div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="gainers" className="pt-0 mt-0 space-y-1">
                {gainers.map(stock => (
                  <div 
                    key={stock.id}
                    className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleStockClick(stock.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.id}</span>
                      <span className="text-sm text-muted-foreground">{stock.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium">₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      <span className="text-sm gain-text">+{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="losers" className="pt-0 mt-0 space-y-1">
                {losers.map(stock => (
                  <div 
                    key={stock.id}
                    className="flex justify-between items-center py-2 px-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleStockClick(stock.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{stock.id}</span>
                      <span className="text-sm text-muted-foreground">{stock.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium">₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      <span className="text-sm loss-text">{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TopMovers;
