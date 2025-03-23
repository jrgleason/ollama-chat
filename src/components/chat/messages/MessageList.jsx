// MessageList.jsx
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem.jsx';

function MessageList({ messages, model, isLoading }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg font-medium mb-1">Start a conversation</p>
                <p className="text-sm text-center max-w-md">
                    Send a message to begin chatting with the {model} model
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-4 py-6">
            {messages.map((message, index) => (
                <MessageItem key={index} message={message} model={model} />
            ))}

            {isLoading && (
                <div className="flex justify-start mb-6">
                    <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">{model || 'AI'}</div>
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
    );
}

export default MessageList;