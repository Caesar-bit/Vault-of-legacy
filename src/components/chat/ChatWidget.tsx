import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../types';
import { fetchChatHistory } from '../../utils/api';
import { X, Minus, MessageCircle } from 'lucide-react';

export function ChatWidget() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
    connection.start();
    connectionRef.current = connection;
    fetchChatHistory(token).then(setMessages).catch(() => {});
    return () => {
      connection.stop();
    };
  }, [token]);

  useEffect(() => {
    if (minimized) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, minimized]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    await connectionRef.current?.invoke('SendMessage', text);
    setMessage('');
  };

  const close = () => {
    setOpen(false);
    setMinimized(false);
  };

  const header = (
    <div className="flex items-center justify-between bg-blue-600 text-white px-3 py-2 rounded-t">
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
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {open ? (
        <div className="w-80 bg-white shadow-xl rounded-lg overflow-hidden animate-slide-up">
          {header}
          {!minimized && (
            <>
              <div ref={scrollRef} className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 shadow text-sm ${m.userId === user?.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {m.userId === user?.id ? 'Me' : 'Agent'}
                      </p>
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex border-t p-2 gap-2">
                <input
                  className="flex-grow border rounded p-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  className="bg-blue-600 text-white px-3 rounded disabled:opacity-50"
                  disabled={!message.trim()}
                  onClick={sendMessage}
                >
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
