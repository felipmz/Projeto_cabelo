import React, { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  bookingContext?: {
    service: { name: string; price: number; duration: number } | null;
    barber: { name: string; specialty: string } | null;
    date: string;
    time: string;
    clientName: string;
  };
}

const SYSTEM_PROMPT = `Você é o assistente virtual da BarberX, uma barbearia premium. 
Seu nome é "Navalha" (apenas internamente — não precisa se apresentar assim a menos que perguntem).
Você ajuda clientes a escolherem serviços, esclarecer dúvidas sobre preços e horários, e fornecer orientações de cuidados capilares.

Regras:
- Seja direto, amigável e profissional. Respostas curtas e úteis.
- Se perguntado sobre agendamento, incentive o cliente a usar o formulário ao lado.
- Conhecimento de barbearia: cortes, barba, degradê, pigmentação, produtos capilares.
- Horários: Seg–Sáb, 09h–20h.
- Endereço: Rua das Navalhas, 42 — Centro.
- Não invente informações específicas que não foram fornecidas.
- Responda em português (pt-BR).`;

const WELCOME = `Olá! Sou o assistente da **BarberX**. 

Posso te ajudar com:
- Dúvidas sobre nossos serviços
- Dicas de cuidados capilares
- Informações sobre a barbearia

Como posso te ajudar hoje?`;

const AIAssistant: React.FC<AIAssistantProps> = ({ bookingContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const contextSuffix = () => {
    if (!bookingContext) return '';
    const parts: string[] = [];
    if (bookingContext.service) parts.push(`Serviço selecionado: ${bookingContext.service.name}`);
    if (bookingContext.barber) parts.push(`Barbeiro escolhido: ${bookingContext.barber.name}`);
    if (bookingContext.date && bookingContext.time) parts.push(`Data/hora: ${bookingContext.date} às ${bookingContext.time}`);
    if (bookingContext.clientName) parts.push(`Cliente: ${bookingContext.clientName}`);
    return parts.length > 0 ? `\n\n[Contexto atual do agendamento: ${parts.join(', ')}]` : '';
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.role === 'user' && m === userMsg
          ? text + contextSuffix()
          : m.content,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text ?? 'Desculpe, não consegui processar sua mensagem.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Houve um erro de conexão. Tente novamente em instantes.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const renderContent = (text: string) => {
    // Simple markdown bold
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>✂</div>
          <div>
            <div className={styles.name}>Assistente BarberX</div>
            <div className={styles.status}>
              <span className={styles.dot} />
              Online agora
            </div>
          </div>
        </div>
        <div className={styles.aiTag}>IA</div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAI}`}>
            {msg.role === 'assistant' && <div className={styles.msgAvatar}>✂</div>}
            <div
              className={styles.bubble}
              dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className={`${styles.msg} ${styles.msgAI}`}>
            <div className={styles.msgAvatar}>✂</div>
            <div className={styles.bubble}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="Pergunte algo..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
