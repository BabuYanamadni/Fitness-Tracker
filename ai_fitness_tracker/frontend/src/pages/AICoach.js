// src/pages/AICoach.js
import React, { useEffect, useRef, useState } from 'react';
import { aiCoachAPI } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'Create a 4-week beginner workout plan for me',
  'What should I eat before a workout?',
  'How can I improve my running endurance?',
  'Suggest a high-protein meal plan for muscle gain',
  'What are the best exercises for weight loss?',
  'Help me with a recovery routine after heavy lifting',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem', animation: 'fadeUp 0.3s ease',
    }}>
      {!isUser && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', marginRight: '0.75rem', marginTop: '2px',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '0.85rem 1.1rem',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-d))'
          : 'var(--clr-surface2)',
        color: isUser ? '#0a0e1a' : 'var(--clr-text)',
        fontSize: '0.9rem', lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid var(--clr-border)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem', textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function AICoach() {
  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [sending,       setSending]       = useState(false);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [tab,           setTab]           = useState('chat');
  const [planGoal,      setPlanGoal]      = useState('');
  const [planConstraints, setPlanConstraints] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [generating,    setGenerating]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    aiCoachAPI.getConversations().then(({ data }) => setConversations(data.results || data)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const { data } = await aiCoachAPI.getMessages(conv.id);
      setMessages(data);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoadingMsgs(false); }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content) return;
    setInput('');
    setSending(true);

    const tempUser = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUser]);

    try {
      let reply;
      if (!activeConv) {
        const { data } = await aiCoachAPI.startChat({ message: content });
        const newConv = { id: data.conversation_id, title: content.slice(0, 60) };
        setActiveConv(newConv);
        setConversations(prev => [newConv, ...prev]);
        reply = data.reply;
      } else {
        const { data } = await aiCoachAPI.sendMessage(activeConv.id, { message: content });
        reply = data;
      }
      setMessages(prev => [...prev, reply]);
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const generatePlan = async (e) => {
    e.preventDefault();
    if (!planGoal.trim()) return;
    setGenerating(true);
    setGeneratedPlan('');
    try {
      const { data } = await aiCoachAPI.generatePlan({ goals: planGoal, constraints: planConstraints });
      setGeneratedPlan(data.plan);
    } catch { toast.error('Plan generation failed'); }
    finally { setGenerating(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">AI Coach <span style={{ color: 'var(--clr-primary)' }}>🤖</span></h1>
        <p style={{ color: 'var(--clr-muted)' }}>Your personal AI-powered fitness coach, available 24/7</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--clr-border)', paddingBottom: '0.5rem' }}>
        {['chat', 'generate plan'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 1rem', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem',
            color: tab === t ? 'var(--clr-primary)' : 'var(--clr-muted)',
            borderBottom: tab === t ? '2px solid var(--clr-primary)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', height: '70vh' }}>
          {/* Sidebar conversations */}
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
            <button className="btn btn-primary" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}
              onClick={() => { setActiveConv(null); setMessages([]); }}>+ New Chat</button>
            {conversations.length === 0 && <p style={{ color: 'var(--clr-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>No conversations yet</p>}
            {conversations.map(c => (
              <button key={c.id} onClick={() => openConversation(c)} style={{
                background: activeConv?.id === c.id ? 'rgba(0,229,160,0.1)' : 'var(--clr-surface2)',
                border: `1px solid ${activeConv?.id === c.id ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                borderRadius: 'var(--r-md)', padding: '0.75rem', cursor: 'pointer', textAlign: 'left',
                color: 'var(--clr-text)', transition: 'all 0.15s',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title || 'New conversation'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)', marginTop: '0.2rem' }}>
                  {c.message_count} messages
                </div>
              </button>
            ))}
          </div>

          {/* Chat window */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>🤖</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>AI Fitness Coach</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-primary)' }}>● Online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {loadingMsgs && <Loader text="Loading messages…" />}
              {!loadingMsgs && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Hi! I'm your AI Coach</h3>
                  <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Ask me anything about fitness, nutrition, or training!</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {QUICK_PROMPTS.map(p => (
                      <button key={p} onClick={() => sendMessage(p)} style={{
                        background: 'var(--clr-surface2)', border: '1px solid var(--clr-border)',
                        borderRadius: '50px', padding: '0.4rem 0.9rem', cursor: 'pointer',
                        color: 'var(--clr-text)', fontSize: '0.8rem', transition: 'all 0.15s',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {sending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--clr-muted)', fontSize: '0.85rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  }}>🤖</div>
                  <span>Thinking…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: '0.75rem' }}>
              <input
                className="input-field"
                placeholder="Ask your AI coach anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sending}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => sendMessage()} disabled={sending || !input.trim()} style={{ padding: '0.65rem 1.2rem' }}>
                {sending ? '…' : '→'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATE PLAN TAB ── */}
      {tab === 'generate plan' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h2 className="section-title">Generate AI Workout Plan</h2>
            <form onSubmit={generatePlan}>
              <div className="form-group">
                <label>Your Goals *</label>
                <textarea className="input-field" rows={4}
                  placeholder="e.g. I want to lose 10kg over 3 months, I'm a beginner, I can train 3 days a week…"
                  value={planGoal} onChange={e => setPlanGoal(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Constraints / Limitations</label>
                <textarea className="input-field" rows={3}
                  placeholder="e.g. No jumping exercises, lower back pain, only have dumbbells…"
                  value={planConstraints} onChange={e => setPlanConstraints(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={generating}>
                {generating ? '⏳ Generating…' : '✨ Generate Plan'}
              </button>
            </form>
          </div>
          <div className="card" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            <h2 className="section-title">Your AI Plan</h2>
            {generating && <Loader text="AI is crafting your plan…" />}
            {!generating && !generatedPlan && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--clr-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                <p>Fill in your goals and generate a personalised plan</p>
              </div>
            )}
            {generatedPlan && (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--clr-text)' }}>
                {generatedPlan}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
