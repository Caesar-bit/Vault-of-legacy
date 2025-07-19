import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from '../../types';

export function ChatWidget() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

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
    return () => {
      connection.stop();
    };
  }, [token]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    await connectionRef.current?.invoke('SendMessage', text);
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-white rounded shadow-lg w-64 h-80 flex flex-col relative">
          <div className="flex-grow overflow-y-auto p-2 text-sm">
            {messages.map((m) => (
              <div key={m.id} className="mb-1">
                <strong>
                  {m.userId === user?.id
                    ? 'Me'
                    : m.userId === 'bot'
                      ? 'Bot'
                      : 'Agent'}
                  :
                </strong>{' '}
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex">
            <input
              className="flex-grow border rounded mr-2 p-1 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="px-2 text-sm bg-blue-500 text-white rounded" onClick={sendMessage}>
              Send
            </button>
          </div>
          <button
            className="absolute top-1 right-1 text-gray-500 hover:text-black"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-500 rounded-full w-12 h-12 text-white"
          onClick={() => setOpen(true)}
        >
          Chat
        </button>
      )}
    </div>
  );
}
