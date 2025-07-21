import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../types';
import { fetchChatHistory, fetchFaqs } from '../../utils/api';
import { X, Minus, MessageCircle } from 'lucide-react';

export function ChatWidget() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [faqs, setFaqs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchFaqs(token).then(setFaqs).catch(() => {});
    fetchChatHistory(token).then(setMessages).catch(() => {});
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setLoading(false);
    });
    connection.on('FaqList', (list: string[]) => setFaqs(list));
    connection.on('Welcome', (text: string) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), userId: 'bot', content: text, timestamp: new Date().toISOString() }
      ]);
    });
    connection.start();
    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, [token]);

  useEffect(() => {
    if (minimized) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, minimized]);

  const send = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), userId: user?.id || '', content, timestamp: new Date().toISOString() }
    ]);
    setMessage('');
    setLoading(true);
    await connectionRef.current?.invoke('SendMessage', content);
  };

  const close = () => { setOpen(false); setMinimized(false); };

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {open ? (
        <div className="w-80 bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-blue-600 text-white px-3 py-2">
            <span className="font-semibold">Support</span>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(!minimized)} className="hover:text-gray-200">
                <Minus size={14} />
              </button>
              <button onClick={close} className="hover:text-gray-200">
                <X size={14} />
              </button>
            </div>
          </div>
          {!minimized && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={m.userId === user?.id ? 'text-right' : ''}>
                    <span className="font-bold mr-1">{m.userId === user?.id ? 'Me' : 'Bot'}:</span>
                    <span>{m.content}</span>
                  </div>
                ))}
                {loading && <div className="text-gray-500">Bot is typing...</div>}
              </div>
              {faqs.length > 0 && (
                <div className="p-2 flex flex-wrap gap-2 border-t">
                  {faqs.map((q) => (
                    <button key={q} onClick={() => send(q)} className="text-xs bg-gray-200 rounded-full px-2 py-1 hover:bg-gray-300">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex border-t p-2 gap-2">
                <input
                  className="flex-grow border rounded p-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <button className="bg-blue-600 text-white px-3 rounded" onClick={() => send()}>
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          className="bg-blue-600 rounded-full w-12 h-12 text-white flex items-center justify-center shadow-lg"
          onClick={() => setOpen(true)}
        >
          <MessageCircle />
        </button>
      )}
    </div>
  );
}
