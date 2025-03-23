// OllamaChat.jsx
import React, { useState, useEffect } from 'react';
import Header from './header/Header';
import MessageList from './chat/messages/MessageList';
import ChatInput from './chat/input/ChatInput';

function OllamaChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('llama2');
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch('http://127.0.0.1:11434/api/tags');
            const data = await response.json();
            if (data.models) {
                setAvailableModels(data.models);
                if (data.models.length > 0) {
                    setModel(data.models[0].name);
                }
            }
        } catch (error) {
            console.error('Error fetching models:', error);
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

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

            setMessages(prev => [...prev, { role: 'assistant', content: cleanedContent }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'system',
                    content: `Error: ${error.message}. Make sure Ollama is running at http://127.0.0.1:11434/`
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden">
            <Header
                model={model}
                setModel={setModel}
                availableModels={availableModels}
                fetchModels={fetchModels}
            />

            <div className="flex-1 overflow-hidden max-w-4xl w-full mx-auto">
                <MessageList messages={messages} model={model} isLoading={isLoading} />
            </div>

            <ChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}

export default OllamaChat;