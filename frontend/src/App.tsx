import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Bot, Shield, Zap, Loader2, User } from 'lucide-react';
import axios from 'axios';

// Add Markdown support for prettier rendering
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleResearch = async () => {
    if (!query.trim()) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsSearching(true);

    try {
      // Connects to your FastAPI /research endpoint
      // Send chat history along with the new query
      const response = await axios.post('http://localhost:8000/research', {
        query: userMessage.content,
        chat_history: messages
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.result
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Agent link broken:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error: The agents couldn't reach the cloud brain."
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-6">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <header className="text-center mb-8 pt-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
        >
          NEXUS-AI
        </motion.h1>
        <p className="text-zinc-500 mt-2 font-mono uppercase tracking-[0.2em] text-xs">Multi-Agent Intelligence Hub</p>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col min-h-0">

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center opacity-50">
              <Bot size={48} className="mb-4" />
              <p>Start a conversation with the agents.</p>
              {/* Feature Cards as a welcome state */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-xl text-center">
                {[
                  { icon: <Shield size={18} />, label: "Local Privacy" },
                  { icon: <Zap size={18} />, label: "Fast Inference" },
                  { icon: <Bot size={18} />, label: "Multi-Agent" }
                ].map((f, i) => (
                  <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 py-3 rounded-2xl text-zinc-500 text-sm flex items-center justify-center gap-2">
                    {f.icon} {f.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Bot size={16} className="text-blue-400" />
                  </div>
                )}

                <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user'
                  ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 rounded-tr-none'
                  : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none prose prose-invert prose-blue max-w-none'
                  }`}>
                  {/* Render Markdown for assistant messages */}
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        ul: ({ ...props }) => <ul className="list-disc pl-4 my-2 text-zinc-300" {...props} />,
                        li: ({ ...props }) => <li className="my-1" {...props} />,
                        p: ({ ...props }) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
                        strong: ({ ...props }) => <strong className="text-blue-200 font-semibold" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700/20 flex items-center justify-center shrink-0 border border-zinc-600/30">
                    <User size={16} className="text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1 h-full items-center">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-2 backdrop-blur-xl shadow-2xl mb-4">
          <div className="flex items-center gap-3 px-4">
            <Search className="text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Ask anything..."
              className="flex-1 bg-transparent py-4 outline-none text-zinc-200 placeholder:text-zinc-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              disabled={isSearching}
            />
            <button
              onClick={handleResearch}
              disabled={isSearching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed p-3 rounded-2xl transition-all"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;