// MessageItem.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function MessageItem({ message, model }) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    const getMessageStyle = () => {
        if (isUser) return 'bg-indigo-600 text-white';
        if (isSystem) return 'bg-red-100 text-red-800 border border-red-200';
        return 'bg-white text-gray-800 border border-gray-200';
    };

    const markdownComponents = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code {...props} className={className}>
                    {children}
                </code>
            )
        },
        p: ({children}) => <p className="mb-2">{children}</p>,
        h1: ({children}) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
        h2: ({children}) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
        h3: ({children}) => <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>,
        ul: ({children}) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
        ol: ({children}) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
        li: ({children}) => <li className="mb-1">{children}</li>,
        a: ({href, children}) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
    };

    return (
        <div className={`mb-6 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${getMessageStyle()}`}>
                <div className="text-xs opacity-75 mb-1">
                    {isUser ? 'You' : isSystem ? 'System' : model || 'AI'}
                </div>
                <div className="space-y-1 prose-sm max-w-none">
                    {isUser ? (
                        <div>{message.content}</div>
                    ) : (
                        <ReactMarkdown components={markdownComponents}>
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageItem;