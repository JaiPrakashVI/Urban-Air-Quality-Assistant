import React, { useState, useRef, useEffect } from 'react';
import { PollutantTelemetry, VulnerabilityProfile, AssistantMessage } from '../../types/aqi';
import { askAssistant } from '../../services/geminiService';
import { validateUserQuery } from '../../services/securitySanitizer';
import { Bot, Send, User, Sparkles, AlertCircle, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';

interface ChatAssistantProps {
  telemetry: PollutantTelemetry;
  persona: VulnerabilityProfile;
  cityName: string;
}

const ChatAssistantComponent: React.FC<ChatAssistantProps> = ({
  telemetry,
  persona,
  cityName,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am **AeroShield**, your context-aware Urban Air Quality Assistant.

Currently in **${cityName}**, the ambient AQI is **${telemetry.aqi} (${telemetry.category})** with fine particulate PM2.5 at **${telemetry.pm25} µg/m³**.

I am tuned to your **${persona.title}** profile (Biological Risk Multiplier: **${persona.baselineMultiplier}x**).

How can I help protect you and your family today? Select one of the quick scenario guides below or ask anything about your local air quality!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Can my child play outdoor this evening?',
        'Is my 6 AM morning walk safe?',
        'Best low-exposure commute to work?',
        'When should I open windows today?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputQuery;
    setValidationWarning(null);

    const validation = validateUserQuery(rawText);
    if (!validation.isValid) {
      setValidationWarning(validation.warning || 'Invalid input.');
      return;
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: validation.sanitizedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const assistantReply = await askAssistant(
        validation.sanitizedText,
        telemetry,
        persona,
        cityName,
        messages
      );
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.error('[ChatAssistant] Error asking assistant:', err);
      const fallbackReply: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to complete request right now. Given the current AQI of ${telemetry.aqi} (${telemetry.category}) in ${cityName}, we recommend avoiding strenuous outdoor exposure and using an N95 respirator.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Common Situation Prompts (Evidence-based routine and IAQ questions)
  const situationPrompts = [
    { label: 'Evening Child Play Advice', query: 'Can my 6-year-old child play outside this evening?' },
    { label: 'Asthmatic Smog Commute Guide', query: 'I have asthma and need to commute 15km to work. What route and precaution should I take?' },
    { label: 'Senior Citizen Morning Walk', query: 'Can I go for my daily 6:00 AM morning walk today?' },
    { label: 'Outdoor Running & Exercise Window', query: 'When is the best window for outdoor running today?' },
    { label: 'Ventilation & Air Purifier Settings', query: 'When should I open my apartment windows and how should I run my air purifier today?' },
  ];

  return (
    <section 
      aria-labelledby="assistant-chat-heading"
      className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col h-[750px] relative overflow-hidden transition-all"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-4 gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <div>
            <h2 id="assistant-chat-heading" className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              AeroShield Conversational Intelligence
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                Gemini & Edge Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Context: <strong className="text-slate-700 dark:text-slate-200">{cityName}</strong> • <strong className="text-slate-700 dark:text-slate-200">{persona.title}</strong> • AQI {telemetry.aqi}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/70 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>Active Guardrails Protected</span>
        </div>
      </div>

      {/* Quick Situation Prompts */}
      <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/5 mb-4 relative z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
          <Terminal className="w-4 h-4" aria-hidden="true" />
          <span>Quick Situation Guides (Click to ask):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {situationPrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.query)}
              disabled={isLoading}
              className="text-xs font-semibold bg-white dark:bg-slate-900/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Feed */}
      <div 
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin relative z-10"
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10'
                }`}
                aria-hidden="true"
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-xs leading-relaxed relative group ${
                isUser 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm' 
                  : 'bg-white dark:bg-slate-950/85 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-none shadow-xs'
              }`}>
                {/* Text Body */}
                <div className="whitespace-pre-wrap space-y-2.5">
                  {m.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split(/(\*\*.*?\*\*)/g).map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={partIdx} className="text-slate-900 dark:text-white font-extrabold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  ))}
                </div>

                {/* Suggested Action Pills */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex flex-wrap gap-2">
                    {m.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        disabled={isLoading}
                        className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white px-3 py-1 rounded-xl transition-all shadow-xs"
                      >
                        {action} →
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer details: Timestamp & Copy Button */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(m.text, m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                      title="Copy response to clipboard"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-950/85 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-3xl rounded-tl-none p-4 text-xs flex items-center gap-2.5 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Analyzing atmospheric boundary layer and synthesizing clinical health advisory...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Security Warning */}
      {validationWarning && (
        <div className="mt-2 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3 rounded-2xl relative z-10">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{validationWarning}</span>
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-3 relative z-10">
        <label htmlFor="user-chat-input" className="sr-only">Ask AeroShield Assistant</label>
        <input
          id="user-chat-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about child play safety, commute, windows, or inhalers in ${cityName}...`}
          maxLength={500}
          disabled={isLoading}
          className="flex-1 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700/80 focus:border-emerald-500 rounded-2xl px-5 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || inputQuery.trim().length === 0}
          aria-label="Send message to assistant"
          className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-sm shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export const ChatAssistant = React.memo(ChatAssistantComponent);
