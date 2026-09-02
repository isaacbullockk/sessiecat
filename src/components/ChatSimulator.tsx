import React, { useState, useEffect, useRef } from 'react';
import { Artist, ChatThread } from '../types';
import { Send, X, MessageSquare, Clock, Disc } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface ChatSimulatorProps {
  artist: Artist;
  thread: ChatThread;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  onSimulateArtistReply: (text: string) => void;
}

export function ChatSimulator({ artist, thread, onClose, onSendMessage, onSimulateArtistReply }: ChatSimulatorProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBypassWarning, setShowBypassWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages, isTyping]);

  const maskContactInfo = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ig;
    const domainRegex = /([a-zA-Z0-9-]+\.)+(com|org|net|nl|io|co|me|it|de|uk|gov)\b/ig;
    const phoneRegex = /(\+?\d[\d-\s()]{7,}\d)/g;
    
    let processed = text;
    let fallbackWarning = false;

    if (emailRegex.test(text)) {
      processed = processed.replace(emailRegex, '[🔒 EMAIL MASKED]');
      fallbackWarning = true;
    }
    if (domainRegex.test(text)) {
      processed = processed.replace(domainRegex, '[🔒 LINK MASKED]');
      fallbackWarning = true;
    }
    if (phoneRegex.test(text)) {
      const digitsOnly = text.replace(/\D/g, '');
      if (digitsOnly.length >= 7) {
        processed = processed.replace(phoneRegex, '[🔒 PHONE MASKED]');
        fallbackWarning = true;
      }
    }

    return { processed, fallbackWarning };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const rawMsg = inputText;
    const { processed, fallbackWarning } = maskContactInfo(rawMsg);
    
    if (fallbackWarning) {
      setShowBypassWarning(true);
    } else {
      setShowBypassWarning(false);
    }

    onSendMessage(processed);
    setInputText('');

    // Trigger typing simulation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Determine the dynamic response of the artist based on user keywords
      let reply = `Hey there! Great to connect with you. I am absolutely up for collaborating on a new project. How is the schedule looking?`;
      const lowercaseMsg = rawMsg.toLowerCase();

      if (lowercaseMsg.includes('gear') || lowercaseMsg.includes('instrument') || lowercaseMsg.includes('equip') || lowercaseMsg.includes('rig')) {
        reply = `Oh yes, I use top of the line gear! Specifically for my gigs I run a professional setup including high-end vintage items. I can bring all options, pedalboards, or custom synthesizers depending on the stage/studio specs!`;
      } else if (lowercaseMsg.includes('pay') || lowercaseMsg.includes('rate') || lowercaseMsg.includes('budget') || lowercaseMsg.includes('price')) {
        reply = `My standard day rate is €${artist.dailyRate}, but I am happy to work within standard union parameters or flat project rates for the right record or tour run. Let's block out dates first!`;
      } else if (lowercaseMsg.includes('studio') || lowercaseMsg.includes('record') || lowercaseMsg.includes('remote')) {
        reply = `I have a gorgeous, treated home studio setup with professional preamps and high-resolution direct-stems available. I usually turn around remote stems within 48 hours in standard 24-bit WAV format!`;
      } else if (lowercaseMsg.includes('tour') || lowercaseMsg.includes('travel') || lowercaseMsg.includes('road') || lowercaseMsg.includes('show')) {
        reply = `I am completely tour-ready! I have an active passport, standard in-ear monitors (IEMs), and I'm very comfortable traveling. My schedule is currently listed as "${artist.availability}".`;
      } else if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi ') || lowercaseMsg.includes('hey')) {
        reply = `Hey there! Thanks for reaching out to me. What kind of project or track are we working on? I'd love to hear more about the sonic direction!`;
      } else if (lowercaseMsg.includes('chart') || lowercaseMsg.includes('sight') || lowercaseMsg.includes('read')) {
        reply = `Absolutely! I am an excellent sight-reader (charts, lead sheets, or standard staff notation). I can also learn by ear rapidly if needed. No problem at all!`;
      }

      onSimulateArtistReply(reply);
    }, 500);
  };

  return (
    <div id="chat-simulator-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-end z-50">
      <div
        id="chat-simulator-content"
        className="w-full max-w-md h-full bg-brand-bg border-l border-white/10 p-0 flex flex-col justify-between overflow-hidden animate-slide-in rounded-none"
      >
        {/* Chat Header */}
        <div className="bg-black px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <SafeImage
                src={artist.avatarUrl}
                alt={artist.name}
                textSeed={artist.name}
                fallbackType="avatar"
                className="w-10 h-10 rounded-none object-cover border border-white/10"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${
                artist.availability === 'Available' ? 'bg-brand-accent' : 'bg-amber-400'
              }`} />
            </div>
            <div>
              <div className="text-white font-extrabold text-sm uppercase tracking-tight">{artist.name}</div>
              <div className="text-[10px] text-white/40 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Disc className="w-3 h-3 text-brand-accent animate-spin" />
                <span>Active Core Established</span>
              </div>
            </div>
          </div>
          <button
            id="close-chat-simulator"
            onClick={onClose}
            className="text-white/40 hover:text-white transition p-2 hover:bg-white/5 rounded-none border border-white/10"
            title="Close Live Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/40">
          <div className="text-center p-3.5 bg-black border border-white/5 rounded-none text-white/40 font-mono text-[10px] leading-normal uppercase tracking-wider">
            Secure direct Session Channel. Discuss chart specs, signal chain setup, and schedule options here. All logs are securely stored.
          </div>

          {showBypassWarning && (
            <div className="p-3 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-none text-[10px] font-mono animate-fade-in space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                <span>🛡️ Platform Shield Triggered</span>
              </div>
              <p className="text-white/70 text-[9px] lowercase font-sans">
                direct off-platform contact details (such as .nl/.org domains, email coordinates, or phone channels) are filtered. secure your recording contract via the lock booking button to securely pay and release direct media links under standard protection guidelines!
              </p>
            </div>
          )}

          {thread.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3.5 text-xs leading-relaxed rounded-none border ${
                  msg.sender === 'user'
                    ? 'bg-brand-accent text-black font-semibold border-brand-accent'
                    : 'bg-white/5 text-white border-white/15'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-white/30 font-mono mt-1 uppercase tracking-widest px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Simulated Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 mr-auto max-w-[80%]">
              <div className="bg-white/5 text-brand-accent rounded-none border border-white/10 p-3.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-white/50">{artist.name} typing</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="bg-black p-4 border-t border-white/10 flex gap-2">
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about charts, gears, rates, etc..."
            className="flex-1 bg-black border border-white/10 text-white placeholder-white/20 rounded-none px-4 py-2.5 text-xs focus:border-brand-accent outline-none transition"
          />
          <button
            id="chat-submit"
            type="submit"
            className="bg-white hover:bg-brand-accent hover:border-brand-accent text-black border border-white p-3 rounded-none font-bold transition-all"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
