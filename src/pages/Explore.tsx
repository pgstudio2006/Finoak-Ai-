
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { getAllStocks } from '@/services/marketService';
import { Stock } from '@/types/stock';
import { useDebounce } from '@/hooks/use-debounce';

const Explore = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sectorFilter, setSectorFilter] = useState('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    document.title = 'Explore Stocks - Finoak AI';
    
    const fetchStocks = async () => {
      setLoading(true);
      try {
        const stocksData = await getAllStocks();
        setStocks(stocksData);
        setFilteredStocks(stocksData);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    filterAndSortStocks();
  }, [debouncedSearchQuery, sortBy, sortOrder, sectorFilter, stocks]);

  const filterAndSortStocks = () => {
    let result = [...stocks];
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(stock => 
        stock.name.toLowerCase().includes(query) || 
        stock.id.toLowerCase().includes(query)
      );
    }
    
    // Apply sector filter
    if (sectorFilter && sectorFilter !== 'all') {
      result = result.filter(stock => stock.sector === sectorFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'price':
          compareResult = a.price - b.price;
          break;
        case 'change':
          compareResult = a.changePercent - b.changePercent;
          break;
        default:
          compareResult = 0;
      }
      
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });
    
    setFilteredStocks(result);
  };

  const handleStockClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSectors = () => {
    const sectors = new Set(stocks.map(stock => stock.sector));
    return ['all', ...Array.from(sectors)];
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container py-6">
        <h1 className="text-3xl font-bold mb-8">Explore Stocks</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stocks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSectors().map(sector => (
                      <SelectItem key={sector} value={sector}>
                        {sector === 'all' ? 'All Sectors' : sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="change">% Change</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Stocks ({filteredStocks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(10).fill(0).map((_, index) => (
                  <div key={index} className="bg-muted animate-pulse h-16 rounded-md"></div>
                ))}
              </div>
            ) : filteredStocks.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 py-2 font-medium text-sm border-b">
                  <div className="col-span-5">Stock</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Change</div>
                  <div className="col-span-3">Sector</div>
                </div>
                
                {filteredStocks.map(stock => (
                  <div 
                    key={stock.id}
                    className="grid grid-cols-12 gap-4 py-3 hover:bg-muted cursor-pointer rounded-md"
                    onClick={() => handleStockClick(stock.id)}
                  >
                    <div className="col-span-5">
                      <div className="font-medium">{stock.id}</div>
                      <div className="text-sm text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`col-span-2 text-right font-medium flex items-center justify-end ${stock.change >= 0 ? 'gain-text' : 'loss-text'}`}>
                      {stock.change >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                      <span>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="col-span-3 text-sm flex items-center">
                      {stock.sector}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No stocks found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Explore;
