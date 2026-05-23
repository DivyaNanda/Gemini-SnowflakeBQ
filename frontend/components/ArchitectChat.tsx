import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { chatWithArchitect } from '../services/geminiService';
import { ChatMessage } from '../types';

const SUGGESTED_PROMPTS = [
  "Explain BigQuery clustering vs partitioning.",
  "How does BigQuery handle Snowflake's micro-partitions?",
  "Best practices for migrating Snowflake Tasks to BigQuery.",
  "How to handle Snowflake's zero-copy clones in Google Cloud?"
];

const ArchitectChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your Senior Cloud Migration Architect. I specialize in migrating enterprise data warehouses from Snowflake to Google BigQuery. Ask me anything about schema mapping, query optimization, partitioning strategies, or cost management.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithArchitect(history, textToSend);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I apologize, but I encountered an error processing your request. Please ensure your API key is valid and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950">
      {/* Chat Header */}
      <div className="bg-brand-dark border-b border-brand-border p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-bigquery" />
            Architect Assistant
          </h2>
          <p className="text-slate-400 text-xs mt-1">Consult with our AI Architect on complex migration strategies and best practices.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-bigquery text-white rounded-tr-none'
                  : 'bg-brand-card border border-brand-border text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className="text-[10px] text-slate-400 block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-brand-card border border-brand-border rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-brand-bigquery" />
              Architect is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">Suggested Topics:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-slate-900 hover:bg-slate-800 border border-brand-border text-xs text-slate-300 px-3 py-1.5 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-brand-border bg-brand-dark">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about schema design, clustering, or paste a complex query snippet..."
            className="flex-1 bg-slate-950 border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-bigquery"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-brand-bigquery hover:bg-brand-bigquery/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArchitectChat;
