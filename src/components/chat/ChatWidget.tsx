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
  const [status, setStatus] = useState<'offline' | 'connecting' | 'online'>('offline');
  const connectionRef = useRef<HubConnection>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      setMessages((prev) => (msg.userId === user?.id ? prev : [...prev, msg]));
      setLoading(false);
    });
    connection.on('FaqList', (list: string[]) => setFaqs(list));
    connection.on('Welcome', (text: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userId: 'bot',
          content: text,
          timestamp: new Date().toISOString(),
        },
      ]);
    });
    connection.onreconnecting(() => setStatus('connecting'));
    connection.onreconnected(() => setStatus('online'));
    connection.onclose(() => setStatus('offline'));

    setStatus('connecting');
    connection
      .start()
      .then(async () => {
        setStatus('online');
        await Promise.all([
          fetchFaqs(token).then(setFaqs).catch(() => {}),
          fetchChatHistory(token).then(setMessages).catch(() => {}),
        ]);
      })
      .catch(() => setStatus('offline'));

    connectionRef.current = connection;
    return () => {
      connection.stop();
      connectionRef.current = undefined;
    };
  }, [open, token, user?.id]);

  useEffect(() => {
    if (minimized) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, minimized]);

  const send = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;
    const local = {
      id: crypto.randomUUID(),
      userId: user?.id || '',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, local]);
    setMessage('');
    setLoading(true);
    try {
      if (status === 'offline') {
        await connectionRef.current?.start();
        setStatus('online');
      }
      await connectionRef.current?.invoke('SendMessage', content);
    } catch {
      setStatus('offline');
      setLoading(false);
    }
  };

  const connect = async () => {
    if (!connectionRef.current) return;
    setStatus('connecting');
    try {
      await connectionRef.current.start();
      setStatus('online');
    } catch {
      setStatus('offline');
    }
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
        <div
          className={`text-xs text-center ${
            status === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          } py-1`}
        >
          Bot: {status}
          {status === 'offline' && (
            <button onClick={connect} className="ml-2 underline text-blue-700">
              Connect
            </button>
          )}
          {status === 'connecting' && ' Connecting...'}
        </div>
        {!minimized && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${m.userId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg px-3 py-1 max-w-[70%]`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-gray-500 text-xs">Bot is typing...</div>}
                {faqs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {faqs.map((q) => (
                      <button key={q} onClick={() => send(q)} className="bg-gray-200 rounded-full px-2 py-1 text-xs text-gray-800 hover:bg-gray-300">
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
