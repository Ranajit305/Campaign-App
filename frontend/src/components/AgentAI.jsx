import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { useAIStore } from '../stores/useAIStore';

const AgentAI = () => {

    const { messages, addMessage } = useAIStore();
    const messagesEndRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);

    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;
        addMessage({ text: inputValue, sender: 'user' });
        setInputValue('');
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all"
                >
                    <Bot className="w-8 h-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 h-120 bg-white rounded-xl shadow-xl flex flex-col border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-600 p-3 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5" />
                            <span className="font-medium">AI Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {messages?.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message?.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs p-3 rounded-lg ${message?.sender === 'user'
                                        ? 'bg-indigo-100 text-indigo-900 rounded-br-none'
                                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    <p key={index} style={{ whiteSpace: 'pre-line' }}>
                                        {message?.text}
                                    </p>

                                </div>

                            </div>
                        ))}
                        <div ref={messagesEndRef}></div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentAI;