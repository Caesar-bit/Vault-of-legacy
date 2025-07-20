import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../types';
import { fetchChatHistory } from '../../utils/api';
import { MessageCircle, Minus, X } from 'lucide-react';

export function SupportBotWidget() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pending = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!token) return;
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/support', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      if (msg.userId === user?.id && pending.current[msg.content]) {
        const tempId = pending.current[msg.content];
        delete pending.current[msg.content];
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      setMessages((prev) => [...prev, msg]);
      if (msg.userId === 'bot') {
        setLoading(false);
      }
    });
    connection.on('ReceiveSuggestions', (qs: string[]) => setSuggestions(qs));
    connection
      .start()
      .then(() => connection.invoke('RequestSuggestions'))
      .catch(console.error);
    connectionRef.current = connection;
    fetchChatHistory(token).then(setMessages).catch(() => {});
    return () => {
      connection.stop();
    };
  }, [token]);

  useEffect(() => {
    if (open && connectionRef.current) {
      connectionRef.current.invoke('RequestSuggestions').catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (minimized) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, minimized]);

  const sendMessage = async (override?: string) => {
    const text = (override ?? message).trim();
    if (!text) return;
    const localId = `local-${Date.now()}`;
    const userId = user?.id || '';
    const localMsg: ChatMessage = {
      id: localId,
      userId,
      content: text,
      timestamp: new Date().toISOString(),
    };
    pending.current[text] = localId;
    setMessages((prev) => [...prev, localMsg]);
    setMessage('');
    setLoading(true);
    try {
      await connectionRef.current?.invoke('SendMessage', text);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== localId));
      delete pending.current[text];
    }
  };

  const header = (
    <div className="flex items-center justify-between bg-blue-600 text-white px-3 py-2 rounded-t">
      <span className="font-semibold">Support</span>
      <div className="flex gap-1">
        <button onClick={() => setMinimized(!minimized)} className="hover:text-gray-200">
          <Minus size={14} />
        </button>
        <button onClick={() => { setOpen(false); setMinimized(false); }} className="hover:text-gray-200">
          <X size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {open ? (
        <div className="w-80 bg-white shadow-xl rounded-lg overflow-hidden">
          {header}
          {!minimized && (
            <>
              <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-2 text-gray-900">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 ${m.userId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      <p>{m.content}</p>
                      <span className="block text-xs opacity-60 mt-1">{format(new Date(m.timestamp), 'p')}</span>
                    </div>
                  </div>
                ))}
                {loading && <div className="text-gray-500 text-xs">Bot is typing...</div>}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="bg-gray-200 rounded-full px-2 py-1 text-xs text-gray-800 hover:bg-gray-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex border-t p-2 gap-2">
                <input
                  className="flex-grow border rounded p-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="bg-blue-600 text-white px-3 rounded" onClick={() => sendMessage()}>Send</button>
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
