"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft, X, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Booking, Property, Faq } from '@/lib/types';
import { answerTripQuestion } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

type ChatbotProps = {
  booking: Booking;
  property: Property;
  faqs: Faq[];
};

export function Chatbot({ booking, property, faqs }: ChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hi ${user?.name?.split(' ')[0]}! How can I help you with your trip to ${property.title}?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await answerTripQuestion({
        question: input,
        booking: booking,
        property: property,
        faqs: faqs
      });
      const botMessage: Message = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <MessageSquarePlus className="w-8 h-8" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-full max-w-sm md:w-[400px] h-[500px] shadow-2xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6" />
            <CardTitle className="text-lg font-headline">Airbnb Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex items-end gap-2", message.sender === 'user' ? 'justify-end' : '')}>
                  {message.sender === 'bot' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm break-words",
                      message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                    )}
                  >
                    {message.text}
                  </div>
                   {message.sender === 'user' && user && (
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={user.avatar} alt={user.name}/>
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-end gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2 rounded-bl-none">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-0"></span>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></span>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></span>
                      </div>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your trip..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
