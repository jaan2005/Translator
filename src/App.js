import React, { useState, useEffect, useCallback } from 'react';
// IMPORTING REACT ROUTER
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

// --- API Helper Function ---
async function callGeminiApi(prompt) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
  if (!apiKey) return "Error: API Key is missing in .env file";

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "Error: Invalid response.";
  } catch (error) {
    return "Error: Unable to get translation. " + error.message;
  }
}

// --- 1. Translator Component ---
const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    const prompt = `Translate "${inputText}" to ${targetLanguage}. Output only the translation.`;
    const result = await callGeminiApi(prompt);
    setTranslatedText(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Text Translator</h2>
      <div className="mb-4">
        <textarea
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
          rows="4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text..."
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          placeholder="Language (e.g. Spanish)"
        />
      </div>
      <button
        onClick={handleTranslate}
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Translating...' : 'Translate'}
      </button>
      {translatedText && (
        <div className="mt-6 p-4 bg-gray-900 rounded-md border border-gray-700 text-white">
          {translatedText}
        </div>
      )}
    </div>
  );
};

// --- 2. String Generator Component (UPDATED UI) ---
const StringGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [generatedString, setGeneratedString] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const generateString = useCallback(() => {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charSet = lowercaseChars;
    if (includeUppercase) charSet += uppercaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;

    if (charSet.length === 0) return;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    setGeneratedString(result);
    setCopySuccess(false);
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    generateString();
  }, [generateString]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Helper component for the checkbox cards
  const CheckboxCard = ({ label, checked, onChange }) => (
    <div 
      onClick={() => onChange(!checked)}
      className="bg-gray-700 p-3 rounded-md flex items-center cursor-pointer hover:bg-gray-600 transition-colors select-none"
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${checked ? 'bg-blue-500' : 'bg-white'}`}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-gray-200 text-sm font-medium">{label}</span>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-teal-400">Random String Generator</h2>
      
      {/* Output Display */}
      <div className="relative mb-6">
        <div className="w-full p-4 rounded-md bg-gray-900 border border-gray-700 flex items-center justify-between">
          <span className="text-white font-mono text-lg tracking-wider truncate mr-4">
            {generatedString}
          </span>
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
            title="Copy"
          >
            {copySuccess ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Slider Section */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-gray-200 font-medium">String Length</label>
        <div className="flex items-center flex-1 mx-4">
          <input
            type="range"
            min="6"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
        <div className="bg-gray-700 text-white px-3 py-1 rounded font-mono">
          {length}
        </div>
      </div>

      {/* Checkboxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <CheckboxCard 
          label="Uppercase (A-Z)" 
          checked={includeUppercase} 
          onChange={setIncludeUppercase} 
        />
        <CheckboxCard 
          label="Numbers (0-9)" 
          checked={includeNumbers} 
          onChange={setIncludeNumbers} 
        />
        <CheckboxCard 
          label="Symbols (!@#)" 
          checked={includeSymbols} 
          onChange={setIncludeSymbols} 
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateString}
        className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-lg"
      >
        Generate New String
      </button>
    </div>
  );
};

// --- 3. Home Component ---
const Home = () => (
  <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-2xl mx-auto animate-fade-in">
    <h2 className="text-3xl font-bold mb-4 text-white">Welcome!</h2>
    <p className="text-gray-300 mb-6">
      This application demonstrates <b>Client-Side Routing</b> using <code>react-router-dom</code>.
    </p>
    <p className="text-gray-400">Select a tool from the navigation bar above.</p>
  </div>
);

// --- Navigation Component ---
const Navigation = () => {
  const getLinkClass = ({ isActive }) => 
    `py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
      isActive 
        ? "bg-indigo-600 text-white shadow-lg" 
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <nav className="flex justify-center gap-4 mb-8 bg-gray-800 p-4 rounded-lg shadow-md max-w-2xl mx-auto">
      <NavLink to="/" className={getLinkClass} end>Home</NavLink>
      <NavLink to="/translator" className={getLinkClass}>Translator</NavLink>
      <NavLink to="/generator" className={getLinkClass}>Generator</NavLink>
    </nav>
  );
};

// --- Main App Component ---
export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen font-sans p-8">
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        `}</style>
        
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">
            React Router App
          </h1>
        </header>

        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="/generator" element={<StringGenerator />} />
        </Routes>
        
      </div>
    </Router>
  );
}