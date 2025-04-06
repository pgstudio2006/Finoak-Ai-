
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import AIChat from '@/components/AIChat';

const Chat = () => {
  const { theme } = useTheme();
  
  useEffect(() => {
    document.title = 'AI Chat - Finoak AI';
  }, []);

  return (
    <div className={`min-h-screen ${theme}`}>
      <Navbar />
      
      <main className="container py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Financial AI Assistant</h1>
          
          <div className="mb-6">
            <p className="text-muted-foreground">
              Chat with our AI assistant to get insights, market analysis, and educational information about the Indian stock market. 
              Ask about stock terms, investment strategies, or get help understanding market movements.
            </p>
          </div>
          
          <AIChat />
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              Note: The AI assistant provides information for educational purposes only. 
              The responses should not be considered as financial advice. Always consult with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
