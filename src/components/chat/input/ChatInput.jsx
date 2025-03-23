// ChatInput.jsx
import React, { useRef, useEffect } from 'react';

function ChatInput({ input, setInput, handleSubmit, isLoading }) {
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
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
                className="w-full resize-none rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 min-h-[80px] max-h-[200px] outline-none transition text-gray-800"
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
    );
}

export default ChatInput;