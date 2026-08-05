import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function AIAssistantWidget({ isOpen, onClose, initialContextProduct = null }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm Texti AI Assistant. Ask me anything about fabrics or tell me what you need (e.g. \"I need to buy cotton\").",
      suggestedPrompts: [
        'I need to buy cotton',
        'Show me denim fabrics',
        'Compare cotton vs linen',
        'Recommend sustainable fabrics'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (initialContextProduct) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Inspecting **${initialContextProduct.name}** (${initialContextProduct.gsm} GSM, ${initialContextProduct.fiberComposition}). Ask me about drape, MOQ, care instructions, or request similar alternatives!`
        }
      ]);
    }
  }, [initialContextProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is supported in Chrome and Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.aiChat(query, initialContextProduct);

      const aiMsg = {
        sender: 'ai',
        text: data.reply,
        recommendedProducts: data.recommendedProducts || [],
        navigateUrl: data.navigateUrl,
        actionType: data.actionType,
        suggestedPrompts: data.suggestedPrompts || []
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(data.reply);

      // Auto-navigate to requested page immediately
      if (data.navigateUrl) {
        navigate(data.navigateUrl);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Connection issue. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[350px] sm:w-[380px] h-[520px] bg-stone-950/95 text-white border border-stone-800 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      
      {/* Header */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-[#0c0a09] flex items-center justify-center font-bold shadow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white flex items-center gap-1">
              Texti AI Assistant
            </h3>
            <p className="text-[9px] font-semibold text-amber-400">Intelligent Fabric Concierge</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (speechEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
            className={`p-1.5 rounded-lg text-xs transition-colors ${speechEnabled ? 'text-amber-400 bg-stone-800' : 'text-stone-500'}`}
            title="Toggle Voice Response"
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs font-sans">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-[#0c0a09] rounded-br-none font-semibold shadow-md'
                  : 'bg-stone-900/90 text-stone-200 rounded-bl-none border border-stone-800 shadow'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Explicit Navigation Button */}
              {msg.navigateUrl && (
                <button
                  onClick={() => navigate(msg.navigateUrl)}
                  className="mt-2.5 w-full bg-amber-500 hover:bg-amber-400 text-[#0c0a09] font-bold text-[10px] py-1.5 px-3 rounded flex items-center justify-center gap-1 shadow transition-colors"
                >
                  View Filtered Marketplace <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {/* Recommended Product Cards inside AI response */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-2.5 space-y-1.5 border-t border-stone-800 pt-2">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                    Fabric Matches:
                  </span>
                  {msg.recommendedProducts.slice(0, 2).map(p => (
                    <div
                      key={p.id}
                      className="p-1.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <img
                        src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80'}
                        alt={p.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[10px] font-bold text-white truncate">{p.name}</h5>
                        <span className="text-[9px] text-amber-400 font-bold">₹{p.price.toLocaleString('en-IN')}/m</span>
                      </div>
                      <button
                        onClick={() => addToCart(p, p.moq)}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-[#0c0a09] text-[9px] font-bold rounded"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
              <div className="mt-2 flex flex-col gap-1 w-full">
                {msg.suggestedPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-3 py-1.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3 h-3 text-stone-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-[11px] p-2.5 bg-stone-900/80 rounded-lg border border-stone-800">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Texti AI analyzing textile query & navigating...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2.5 border-t border-stone-800 bg-stone-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'I need to buy cotton'"
            className="flex-1 bg-stone-950 text-white text-xs px-3.5 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-400 placeholder-stone-500"
          />

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-800 text-stone-300 hover:text-white'
            }`}
            title="Voice Search"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0c0a09] font-bold flex items-center justify-center shadow shrink-0 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
