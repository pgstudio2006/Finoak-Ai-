import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon, User } from 'lucide-react';
import { chatWithAssistant } from '@/services/aiService';

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: 'Hello! I\'m your AI financial assistant. How can I help you with Indian stock market insights today?'
  }
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isTyping) return;
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      console.log('Sending chat message:', userMessage);
      const response = await chatWithAssistant([...messages, userMessage]);
      console.log('Received response:', response);
      
      if (response && response.trim()) {
        const assistantMessage: Message = { role: 'assistant', content: response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Empty response from assistant');
      }
    } catch (error) {
      console.error('Error chatting with AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(`I apologize, but I encountered an error: ${errorMessage}`);
      const errorAssistantMessage: Message = { 
        role: 'assistant', 
        content: `I apologize, but I encountered an error: ${errorMessage}` 
      };
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-2">
        <CardTitle>FinoakAI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-muted">
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Avatar className="h-8 w-8 bg-finoak-teal text-white">
                      <span>AI</span>
                    </Avatar>
                  )}
                </div>
                <div
                  className={`ml-2 rounded-lg px-4 py-2 text-sm ${
                    message.role === 'user'
                      ? 'mr-2 bg-finoak-teal text-white'
                      : 'bg-muted'
                  }`}
                >
                  {message.content.split('\n').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i !== message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border bg-muted">
                  <Avatar className="h-8 w-8 bg-finoak-teal text-white">
                    <span>AI</span>
                  </Avatar>
                </div>
                <div className="ml-2 rounded-lg px-4 py-2 text-sm bg-muted">
                  <div className="flex space-x-1">
                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"></div>
                    <div className="animate-bounce delay-100 h-2 w-2 bg-gray-500 rounded-full"></div>
                    <div className="animate-bounce delay-200 h-2 w-2 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask about stock market insights..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            size="icon" 
            disabled={input.trim() === '' || isTyping}
            onClick={handleSend}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
