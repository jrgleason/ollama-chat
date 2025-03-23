// ModelSelector.jsx
import React from 'react';

function ModelSelector({ model, setModel, availableModels, fetchModels }) {
    return (
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
    );
}

export default ModelSelector;