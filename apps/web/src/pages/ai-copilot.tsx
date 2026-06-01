import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Copilot for VentureFlow. I can help you with investor recommendations, pitch analysis, fundraising strategy, and more. What would you like help with today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on your recent activities and investor preferences, I recommend reaching out to 3 Series A investors from the tech sector. They have shown strong interest in your industry and have recently invested in similar companies.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Copilot</h1>
          <p className="text-gray-600 text-sm mt-1">Get AI-powered recommendations and analysis</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="bg-white border-t border-gray-200 p-6 grid grid-cols-2 gap-3">
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900 text-sm">📊 Investor Recommendations</p>
              <p className="text-xs text-gray-600 mt-1">Get personalized investor matches</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900 text-sm">📈 Pitch Analysis</p>
              <p className="text-xs text-gray-600 mt-1">Analyze your pitch deck</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900 text-sm">✍️ Email Draft</p>
              <p className="text-xs text-gray-600 mt-1">Generate outreach emails</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900 text-sm">💡 Strategy</p>
              <p className="text-xs text-gray-600 mt-1">Fundraising guidance</p>
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your fundraising..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
