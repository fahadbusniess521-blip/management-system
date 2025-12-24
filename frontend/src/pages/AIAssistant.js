import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      text: 'Hello! I\'m the NADEEM&SONSTECH AI Assistant. Ask me anything about your projects, investments, expenses, or team members.',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = {
      type: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/query', { query });
      const { message, data, type, aiResponse } = response.data;

      let responseText = message;
      
      if (data && Array.isArray(data) && data.length > 0) {
        responseText += '\n\nResults:\n';
        data.slice(0, 5).forEach((item, index) => {
          if (type === 'projects') {
            responseText += `\n${index + 1}. ${item.name} (${item.status}) - Source: ${item.source}`;
          } else if (type === 'investments') {
            responseText += `\n${index + 1}. ${item.source}: PKR ${item.amount.toLocaleString()} (${item.status})`;
          } else if (type === 'expenses') {
            responseText += `\n${index + 1}. ${item.name}: PKR ${item.amount.toLocaleString()} - ${item.category}`;
          } else if (type === 'users') {
            responseText += `\n${index + 1}. ${item.name} (${item.role}) - ${item.email}`;
          }
        });
        if (data.length > 5) {
          responseText += `\n\n...and ${data.length - 5} more results`;
        }
      } else if (data && type === 'summary') {
        responseText += `\n\nTotal Investments: PKR ${data.totalInvestments?.toLocaleString() || 0}`;
        responseText += `\nTotal Expenses: PKR ${data.totalExpenses?.toLocaleString() || 0}`;
        responseText += `\nTotal Projects: ${data.projectCount || 0}`;
        responseText += `\nActive Projects: ${data.activeProjects || 0}`;
        responseText += `\nTeam Members: ${data.userCount || 0}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: responseText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Show me all projects from Ali Khan',
    'List active investments above 100,000',
    'How much rent did we pay in July?',
    'Show me all active projects',
    'Give me a company overview',
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              NADEEM&SONSTECH AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ask me anything about your business data
            </p>
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
