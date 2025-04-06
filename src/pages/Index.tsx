import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import MarketOverview from '@/components/MarketOverview';
import TopMovers from '@/components/TopMovers';
import MarketSentiment from '@/components/MarketSentiment';
import AIChat from '@/components/AIChat';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    document.title = 'Finoak AI - Stock Market Intelligence Platform';
  }, []);

  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-finoak-teal to-blue-500 bg-clip-text text-transparent">
              Market Dashboard
            </h1>
            <Badge variant="outline" className="hidden md:flex">Live</Badge>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm text-muted-foreground">
              Last updated
            </div>
            <div className="font-medium">
              {new Date().toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <MarketOverview />
          </div>
          <div>
            <MarketSentiment />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <TopMovers />
          </div>
          <div className="md:col-span-2">
            <AIChat />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
