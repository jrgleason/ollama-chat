// Header.jsx
import React from 'react';
import ModelSelector from './models/ModelSelector.jsx';

function Header({ model, setModel, availableModels, fetchModels }) {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Ollama Chat</h1>
                <ModelSelector
                    model={model}
                    setModel={setModel}
                    availableModels={availableModels}
                    fetchModels={fetchModels}
                />
            </div>
        </div>
    );
}

export default Header;