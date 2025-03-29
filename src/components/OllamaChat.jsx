// OllamaChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './header/Header';
import MessageList from './chat/messages/MessageList';
import ChatInput from './chat/input/ChatInput';

const IP_ADDRESS = "10.0.0.20";

function OllamaChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('doctor-assistant');
    const [availableModels, setAvailableModels] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechEnabled, setSpeechEnabled] = useState(false);

    // Refs for speech synthesis
    const synth = useRef(null);
    const utteranceQueue = useRef([]);
    const currentSpeechContent = useRef('');
    const speakTimeoutId = useRef(null);

    useEffect(() => {
        fetchModels();

        // Initialize speech synthesis
        if (window.speechSynthesis) {
            synth.current = window.speechSynthesis;
            setSpeechEnabled(true);

            // Some browsers need to be "warmed up" to get a proper list of voices
            const loadVoices = () => {
                window.speechSynthesis.getVoices();
            };

            loadVoices();

            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }

            // Some browsers require a user interaction before allowing audio
            console.log("Speech synthesis available. Waiting for user interaction...");
        } else {
            console.warn("Speech synthesis not supported in this browser");
        }

        // Clean up speech synthesis on unmount
        return () => {
            if (synth.current) {
                synth.current.cancel();
            }
            if (speakTimeoutId.current) {
                clearTimeout(speakTimeoutId.current);
            }
        };
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch(`http://${IP_ADDRESS}:11434/api/tags`);
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

    // Speech synthesis functions
    const speakText = (text) => {
        if (!synth.current || !speechEnabled || !text || text.trim() === '') return;

        console.log("Speaking text:", text); // Debug log

        const utterance = new SpeechSynthesisUtterance(text);

        // Set properties for the utterance
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1; // Ensure volume is at maximum

        // Select an English voice if available
        const voices = synth.current.getVoices();
        const englishVoices = voices.filter(voice =>
            voice.lang.startsWith('en-') &&
            !voice.name.includes('Bells') &&
            !voice.name.includes('Boing') &&
            !voice.name.includes('Bahh') &&
            !voice.name.includes('Bad News')
        );

        if (englishVoices.length > 0) {
            // Try to select a natural sounding voice
            const naturalVoice = englishVoices.find(voice =>
                voice.name.includes('Google') ||
                voice.name.includes('Samantha') ||
                voice.name.includes('Daniel') ||
                voice.name.includes('Alex')
            ) || englishVoices[0];

            utterance.voice = naturalVoice;
            console.log("Using voice:", naturalVoice.name);
        }

        // Instead of canceling previous speech, queue it
        synth.current.speak(utterance);
        setIsSpeaking(true);

        utterance.onend = () => {
            // Only set speaking to false if there are no pending utterances
            if (synth.current.pending === false) {
                setIsSpeaking(false);
            }
        };

        utterance.onerror = (event) => {
            console.error("Speech error:", event);
        };
    };

    const speakNext = () => {
        if (!synth.current || utteranceQueue.current.length === 0) {
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        const utterance = utteranceQueue.current.shift();

        utterance.onend = () => {
            // Small delay between sentences for more natural speech
            speakTimeoutId.current = setTimeout(speakNext, 150);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            speakNext();
        };

        synth.current.speak(utterance);
    };

    // Buffer for accumulating text until we have a complete sentence or phrase
    const textBuffer = useRef('');
    const bufferTimeout = useRef(null);

    // Function to speak incremental content as it comes in
    const speakIncremental = (newContent) => {
        if (!synth.current || !speechEnabled) return;

        // Find new text that hasn't been spoken yet
        const newText = newContent.substring(currentSpeechContent.current.length);
        currentSpeechContent.current = newContent;

        if (newText.trim() === '') return;

        // Add new text to the buffer
        textBuffer.current += newText;

        // Clear any existing timeout
        if (bufferTimeout.current) {
            clearTimeout(bufferTimeout.current);
        }

        // Check if we have a complete sentence or a substantial chunk of text
        const hasSentenceEnd = /[.!?]/.test(textBuffer.current);
        const isLargeChunk = textBuffer.current.length > 50;

        if (hasSentenceEnd || isLargeChunk) {
            console.log("Speaking buffered text:", textBuffer.current);
            speakText(textBuffer.current);
            textBuffer.current = '';
        } else {
            // Set a timeout to speak the buffer even if we don't get a sentence end
            // This prevents text from getting stuck in the buffer
            bufferTimeout.current = setTimeout(() => {
                if (textBuffer.current.trim() !== '') {
                    console.log("Speaking buffered text (timeout):", textBuffer.current);
                    speakText(textBuffer.current);
                    textBuffer.current = '';
                }
            }, 1000); // Wait for 1 second before speaking incomplete sentences
        }
    };

    // Function to stop all speech
    const stopSpeech = () => {
        if (synth.current) {
            synth.current.cancel();
            utteranceQueue.current = [];
            setIsSpeaking(false);

            // Clear buffer and any pending timeouts
            textBuffer.current = '';
            if (bufferTimeout.current) {
                clearTimeout(bufferTimeout.current);
                bufferTimeout.current = null;
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Stop any ongoing speech when user sends a new message
        stopSpeech();
        currentSpeechContent.current = '';

        const userMessage = { role: 'user', content: input };
        setInput('');

        // Add only the user message
        setMessages(prev => [...prev, userMessage]);

        // Set loading to true before we start the request
        setIsLoading(true);

        try {
            const response = await fetch(`http://${IP_ADDRESS}:11434/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: [...messages, userMessage]
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Keep isLoading true until we actually start receiving content
            let contentStarted = false;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let rawContent = '';
            let displayContent = '';
            let thinkDepth = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            const newContent = data.message.content;
                            rawContent += newContent;

                            // If this is the first content we're receiving, add an empty assistant message
                            // and set loading to false
                            if (!contentStarted) {
                                contentStarted = true;
                                setIsLoading(false);
                                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
                            }

                            // Process content to filter out thinking tags
                            let i = 0;
                            while (i < newContent.length) {
                                if (newContent.substring(i).startsWith('<think>')) {
                                    thinkDepth++;
                                    i += 7;
                                } else if (thinkDepth > 0 && newContent.substring(i).startsWith('</think>')) {
                                    thinkDepth--;
                                    i += 8;
                                } else if (thinkDepth === 0) {
                                    displayContent += newContent[i];
                                    i++;
                                } else {
                                    i++;
                                }
                            }

                            // Update the UI with filtered content
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1] = {
                                    role: 'assistant',
                                    content: displayContent
                                };
                                return newMessages;
                            });

                            // Speak the incremental content as it comes in
                            speakIncremental(displayContent);
                        }
                    } catch (error) {
                        console.error('Error parsing stream chunk:', error);
                    }
                }
            }

            // If we've never received any content, set loading to false and display an error
            if (!contentStarted) {
                setIsLoading(false);
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'system',
                        content: 'Empty response received. The model may be busy or experiencing issues.'
                    }
                ]);
            }

        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            setMessages(prev => [
                ...prev,
                {
                    role: 'system',
                    content: `Error: ${error.message}. Make sure Ollama is running at http://127.0.0.1:11434/`
                }
            ]);
        }
    };

    // Toggle speech on/off
    const toggleSpeech = () => {
        if (speechEnabled) {
            if (isSpeaking) {
                stopSpeech();
            } else {
                setSpeechEnabled(false);
            }
        } else {
            setSpeechEnabled(true);
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden">
            <Header
                model={model}
                setModel={setModel}
                availableModels={availableModels}
                fetchModels={fetchModels}
                speechEnabled={speechEnabled}
                toggleSpeech={toggleSpeech}
                isSpeaking={isSpeaking}
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