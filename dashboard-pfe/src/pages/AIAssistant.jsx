import React, { useState, useRef, useEffect } from 'react'
import { aiService } from '../services/api.js'
import { Send, Bot } from 'lucide-react'
const SUGGESTIONS = [
  { icon: '📊', text: "Quel est l'état actuel de la ligne PN ?" },
  { icon: '🌡️', text: "Pourquoi y a-t-il une alerte sur la température du sécheur ?" },
  { icon: '⚖️', text: "Quel était le ratio NPK moyen ces dernières heures ?" },
  { icon: '🔧', text: "Proposer des actions correctives pour un dépassement de température sur la granulation." },
  { icon: '⚠️', text: "Quels capteurs sont dans une zone critique en ce moment ?" },
]
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '8px 4px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#7dba3a',
          animation: `ocpBounce 1.2s ${i*0.2}s infinite ease-in-out`,
        }}/>
      ))}
      <style>{`@keyframes ocpBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      gap: 10, alignItems: 'flex-start', marginBottom: 16,
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#006DB7,#7dba3a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,109,183,0.3)',
        }}>
          <Bot size={16} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#006DB7,#004F8A)'
          : 'var(--bg-card)',
        border: isUser
          ? '1px solid rgba(0,109,183,0.4)'
          : '1px solid var(--border)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: 13.5, lineHeight: 1.75,
        whiteSpace: 'pre-wrap',
        boxShadow: isUser
          ? '0 4px 14px rgba(0,109,183,0.2)'
          : '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {!isUser && (
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#7dba3a',
            marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase',
          }}>Assistant OCP IA</div>
        )}
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1e3a5f,#0d1b2e)',
          border: '1px solid rgba(77,159,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#4d9fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>OP</div>
      )}
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
  {
    role: 'assistant',
    content:
      "Bonjour ! Je suis votre assistant IA spécialisé en production d'engrais OCP. Je peux analyser vos données capteurs en temps réel, détecter les anomalies et proposer des actions correctives. Comment puis-je vous aider ?"
  }
])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const { answer } = await aiService.query(q)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion. Vérifiez que le service IA est disponible.'}])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: 'var(--bg-primary)',
      fontFamily: "'Segoe UI', sans-serif",
    }}>

      {/* â”€â”€ HEADER â”€â”€ */}
      <div style={{
        padding: '16px 24px',
        background: 'linear-gradient(135deg,rgba(0,109,183,0.12),rgba(0,166,81,0.08))',
        border: '1px solid rgba(0,109,183,0.15)',
        borderRadius: 14,
        margin: '16px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg,#006DB7,#7dba3a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,109,183,0.35)',
          }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Assistant IA — OCP Production
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Analyse temps réel · Lignes PN · GR · LAV · SEC · ENR · P
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          background: 'rgba(0,166,81,0.1)',
          border: '1px solid rgba(0,166,81,0.25)',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7dba3a', boxShadow: '0 0 6px #7dba3a' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7dba3a' }}>En ligne</span>
        </div>
      </div>

      {/* â”€â”€ MESSAGES â”€â”€ */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 20px 8px',
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#006DB7,#7dba3a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* â”€â”€ SUGGESTIONS â”€â”€ */}
      <div style={{
        padding: '8px 20px',
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => sendMessage(s.text)}
            style={{
              padding: '7px 12px', borderRadius: 20,
              background: 'rgba(0,109,183,0.06)',
              border: '1px solid rgba(0,109,183,0.18)',
              color: '#6b8aad', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
              maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,109,183,0.12)'; e.currentTarget.style.color = '#4d9fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,109,183,0.06)'; e.currentTarget.style.color = '#6b8aad'; }}
          >
            {s.icon} {s.text}
          </button>
        ))}
      </div>

      {/* â”€â”€ INPUT â”€â”€ */}
      <div style={{
        padding: '12px 20px 20px',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Posez votre question sur la production OCP..."
          style={{
            flex: 1, padding: '13px 18px',
            borderRadius: 12,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 14,
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,109,183,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 46, height: 46, borderRadius: 12, border: 'none',
            background: input.trim() && !loading
              ? 'linear-gradient(135deg,#006DB7,#7dba3a)'
              : 'var(--bg-elevated)',
            color: input.trim() && !loading ? '#fff' : '#3d5a7a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.2s',
            boxShadow: input.trim() && !loading ? '0 4px 14px rgba(0,109,183,0.3)' : 'none',
          }}
        >
          <Send size={18} />
        </button>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,109,183,0.3); border-radius: 2px; }
      `}</style>
    </div>
  )
}