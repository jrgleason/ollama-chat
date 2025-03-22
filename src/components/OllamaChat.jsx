// OllamaChat.jsx
import Header from './header/Header';
import MessageList from './chat/messages/MessageList';
import ChatInput from './chat/input/ChatInput';

import React, { useState, useRef, useEffect } from 'react';

function OllamaChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('llama2');
    const [availableModels, setAvailableModels] = useState([]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch available models when the component mounts
    useEffect(() => {
        fetchModels();
        // Focus the input field on load
        inputRef.current?.focus();
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchModels = async () => {
        try {
            const response = await fetch('http://127.0.0.1:11434/api/tags');
            const data = await response.json();
            if (data.models) {
                setAvailableModels(data.models);
                // Set default model to the first available one if there are any
                if (data.models.length > 0) {
                    setModel(data.models[0].name);
                }
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            // If we can't fetch models, set a default list
            setAvailableModels([
                { name: 'llama2' },
                { name: 'mistral' },
                { name: 'gemma' }
            ]);
        }
    };

    const cleanModelResponse = (content) => {
        if (!content.includes('<think>')) return content;
        return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message to chat
        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:11434/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [...messages, userMessage],
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const cleanedContent = cleanModelResponse(data.message.content);

            setMessages(prevMessages => [
                ...prevMessages,
                { role: 'assistant', content: data.message.content }
            ]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: 'system', content: `Error: ${error.message}. Make sure Ollama is running at http://127.0.0.1:11434/` }
            ]);
        } finally {
            setIsLoading(false);
            // Focus the input field after response
            inputRef.current?.focus();
        }
    };

    // Handle message rendering with code block support
    const renderMessage = (content) => {
        const parts = content.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                // Extract code and language
                const codeMatch = part.match(/```(?:([a-zA-Z0-9]+))?\n([\s\S]*?)```/);
                if (codeMatch) {
                    const [, language, code] = codeMatch;
                    return (
                        <div key={i} className="bg-gray-800 rounded-md p-3 my-2 font-mono text-sm text-gray-200 overflow-x-auto">
                            {code}
                        </div>
                    );
                }
            }
            // Regular text
            return part.split('\n').map((line, j) => (
                <div key={`${i}-${j}`}>{line || <br />}</div>
            ));
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Ollama Chat</h1>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Model:</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            {availableModels.map((model) => (
                                <option key={model.name} value={model.name} className="text-gray-800">
                                    {model.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchModels}
                            className="bg-white/20 hover:bg-white/30 rounded p-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                            title="Refresh models"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat container */}
            <div className="flex-1 overflow-hidden max-w-4xl w-full mx-auto">
                {/* Messages area */}
                <div className="h-full overflow-y-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p className="text-lg font-medium mb-1">Start a conversation</p>
                            <p className="text-sm text-center max-w-md">
                                Send a message to begin chatting with the {model} model
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                            >
                                <div
                                    className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm
                    ${message.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : message.role === 'system'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-800 border border-gray-200'}
                  `}
                                >
                                    <div className="text-xs opacity-75 mb-1">
                                        {message.role === 'user' ? 'You' :
                                            message.role === 'system' ? 'System' :
                                                model || 'AI'}
                                    </div>
                                    <div className="space-y-1">
                                        {renderMessage(message.content)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex justify-start mb-6">
                            <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">
                                    {model || 'AI'}
                                </div>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                        <div className="flex-1 relative">
              <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                      }
                  }}
                  placeholder="Type your message here..."
                  className="w-full resize-none rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 min-h-[80px] max-h-[200px] outline-none transition"
                  rows={1}
                  disabled={isLoading}
              />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                Press Enter to send, Shift+Enter for new line
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed h-12 flex-shrink-0"
                            disabled={isLoading || !input.trim()}
                        >
              <span className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Send</span>
              </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OllamaChat;