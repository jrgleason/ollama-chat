// Header.jsx
import React from 'react';

function Header({
                    model,
                    setModel,
                    availableModels,
                    fetchModels,
                    speechEnabled,
                    toggleSpeech,
                    isSpeaking
                }) {
    return (
        <header className="bg-white shadow py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900 mr-4">Ollama Chat</h1>

                <div className="relative">
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {availableModels.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={fetchModels}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Refresh Models
                </button>
            </div>

            <div className="flex items-center">
                <button
                    onClick={toggleSpeech}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        speechEnabled
                            ? (isSpeaking
                                ? 'text-white bg-red-600 hover:bg-red-700'
                                : 'text-white bg-green-600 hover:bg-green-700')
                            : 'text-white bg-gray-500 hover:bg-gray-600'
                    }`}
                    title={speechEnabled ? (isSpeaking ? "Stop Speaking" : "Text-to-Speech Enabled") : "Enable Text-to-Speech"}
                >
                    {speechEnabled
                        ? (isSpeaking ? "Stop Speaking" : "TTS On")
                        : "TTS Off"}
                </button>

                {/* Voice selection could be added here in a future enhancement */}
            </div>
        </header>
    );
}

export default Header;