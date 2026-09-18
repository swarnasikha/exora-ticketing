import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the ExoraDesk AI Assistant. I can help you find information about tickets, count tickets by status or priority, and check assignments. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await api.ai.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-brand-50 border-b border-gray-200 px-6 py-4 flex items-center space-x-3">
        <Bot className="w-6 h-6 text-brand-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-sm text-gray-500">Grounded in real ticket data.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-600 ml-3' : 'bg-gray-200 mr-3'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
              </div>
              <div className={`px-4 py-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex max-w-[80%] flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-900 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Querying database...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ask about tickets (e.g., 'How many high-priority tickets are open?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
