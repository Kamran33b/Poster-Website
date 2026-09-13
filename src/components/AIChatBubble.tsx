import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Sparkles, Send, RefreshCw, Truck, Frame, Sparkle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const INITIAL_WELCOME: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  text: "Hello! I'm Lumina AI, your personal art & shipping guide. Ask me anything about our **shipping timelines**, **solid wood framing**, **archival giclée paper**, or **order policies**!",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTIONS = [
  { label: '🚚 Shipping & Delivery', query: 'How long does shipping take and what are the rates?' },
  { label: '🖼️ Framing & Glass', query: 'What framing materials and glass types do you offer?' },
  { label: '🎨 Paper & Inks', query: 'What paper stock and inks do you use for prints?' },
  { label: '📦 Returns & Replacements', query: 'What is your policy for returns or damaged prints?' }
];

export const AIChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setCurrentView } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const history = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      const data = await res.json();
      const assistantReply = data.reply || "I'm here to help! Ask me anything about our prints or shipping.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        text: "🚚 **Shipping:** 3-5 business days (Free over $100).\n🖼️ **Frames:** Solid Oak, Matte Black, White Wood with 92% UV protection glass.\n🎨 **Paper:** 250 GSM archival giclée matte paper.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([INITIAL_WELCOME]);
  };

  // Simple formatter to bold markdown **text** and bullet lines
  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Process bold syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-stone-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-amber-600 font-bold">•</span>
            <span className="flex-1">{formattedLine}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {/* Subtle Teaser Pill */}
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-stone-900/90 text-amber-300 text-xs font-medium px-3.5 py-2 rounded-full shadow-lg border border-stone-700 backdrop-blur-md cursor-pointer hover:bg-stone-900 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Ask Lumina AI Assistant</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            id="open-ai-chat-btn"
            aria-label="Open AI Customer Support Chat"
            className="relative bg-stone-900 text-white p-4 rounded-full shadow-2xl hover:bg-stone-800 transition-all duration-300 hover:scale-110 active:scale-95 group border border-amber-500/30"
          >
            <MessageSquare className="w-6 h-6 text-amber-300 group-hover:rotate-6 transition-transform" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-stone-900 rounded-full animate-bounce" />
            )}
          </button>
        </div>
      )}

      {/* Floating Chat Modal Card */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-800 border border-amber-500/40 flex items-center justify-center relative">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-stone-100">Lumina AI Support</h3>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">24/7 AI</span>
                </div>
                <p className="text-[11px] text-stone-400">Shipping, Framing & Print Expert</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Reset Conversation"
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf8f5]/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-stone-100 rounded-tr-xs'
                        : 'bg-white text-stone-700 border border-stone-200/80 rounded-tl-xs'
                    }`}
                  >
                    {formatText(msg.text)}
                  </div>
                  <span className="text-[10px] text-stone-400 px-1 block">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-stone-200/80 px-4 py-3 rounded-2xl rounded-tl-xs text-stone-500 flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs">Lumina AI is thinking</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 py-2 bg-stone-100/80 border-t border-stone-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug.query)}
                  className="whitespace-nowrap bg-white text-stone-700 hover:text-stone-900 hover:bg-amber-50 hover:border-amber-300 border border-stone-200/80 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 shadow-2xs"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input Form */}
          <div className="p-3 bg-white border-t border-stone-200/80 shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about shipping, frames, paper..."
                disabled={isLoading}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-stone-800 disabled:opacity-40 transition-all shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4 text-amber-300" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
              <span>Powered by Gemini AI</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCurrentView('contact');
                }}
                className="text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3 text-amber-600" />
                Submit Support Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
