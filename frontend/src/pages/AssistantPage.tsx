import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Volume2, Languages, Mic } from 'lucide-react'
import { api } from '../lib/api'
import { Card, Button, Badge, DisclaimerBanner } from '../components/ui'
import { speak } from '../lib/utils'

interface Message {
  role: 'user' | 'assistant'
  text: string
  language: string
}

const QUICK_EN = ['OPD timings', 'Verify medicine', 'Emergency care', 'Queue status', 'Cardiology floor']
const QUICK_HI = ['ओपीडी समय', 'दवा सत्यापन', 'आपातकाल सेवा', 'टोकन स्थिति', 'हृदय रोग विभाग']

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaste! I am CareBridge AI Health Navigator. I can guide you about OPD timings, departments, medicine verification, queue status and referral procedures. How can I help you today?\n\nनमस्ते! मैं कैरब्रिज एआई स्वास्थ्य सहायक हूँ। मैं ओपीडी, विभागों, दवा सत्यापन और रेफरल की जानकारी दे सकता हूँ।',
      language: 'en'
    }
  ])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text, language }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const r = await api.assistant(text, language)
      const assistantMsg: Message = { role: 'assistant', text: r.reply, language }
      setMessages(prev => [...prev, assistantMsg])
    } finally { setLoading(false) }
  }

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={22} className="text-teal-600" /> Health Assistant</h2>
          <p className="text-sm text-slate-500">English & Hindi · Text & Voice guidance</p>
        </div>
        <div className="flex items-center gap-2">
          <Languages size={16} className="text-teal-600" />
          <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${language === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>EN</button>
          <button onClick={() => setLanguage('hi')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${language === 'hi' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>हिं</button>
        </div>
      </div>

      <DisclaimerBanner text="This assistant provides facility guidance only. It CANNOT diagnose medical conditions or prescribe medications. For emergencies, dial 108." />

      {/* Chat window */}
      <Card className="p-0 overflow-hidden">
        <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-slate-50">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  {m.role === 'assistant' && (
                    <button onClick={() => speak(m.text, m.language)} className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-teal-600 transition-colors">
                      <Volume2 size={12} /> Read aloud
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick actions */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-2">
          {(language === 'en' ? QUICK_EN : QUICK_HI).map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)}
              className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-lg px-2.5 py-1 hover:bg-teal-100 transition-all">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            placeholder={language === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Ask about departments, queues, medicines…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          />
          <Button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
            <Send size={16} />
          </Button>
          {lastAssistant && (
            <Button variant="ghost" onClick={() => speak(lastAssistant.text, lastAssistant.language)}>
              <Volume2 size={16} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

