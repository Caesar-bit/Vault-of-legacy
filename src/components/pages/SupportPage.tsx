import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createTicket, fetchTickets } from '../../utils/api';
import { SupportTicket } from '../../types';
import { MessageCircle, Plus } from 'lucide-react';
import { AnimatedAlert } from '../AnimatedAlert';

export function SupportPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    fetchTickets(token).then(setTickets).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [token, load]);

  const submit = async () => {
    if (!token || !title.trim() || !description.trim()) return;
    try {
      await createTicket(token, { title, description });
      setTitle('');
      setDescription('');
      setAlert('Ticket created');
      load();
    } catch {
      setAlert('Failed to create ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white p-6 shadow-lg flex items-center gap-4">
        <MessageCircle className="w-10 h-10" />
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-white/80">Create tickets and review your requests.</p>
        </div>
      </div>

      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Ticket
        </h2>
        <input
          className="border w-full p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border w-full p-2 rounded"
          placeholder="Describe your issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>Submit</button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">My Tickets</h2>
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className="border rounded p-2">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-gray-600">{t.status} - {new Date(t.createdAt).toLocaleString()}</div>
              <p className="text-sm mt-1">{t.description}</p>
            </li>
          ))}
          {tickets.length === 0 && <li>No tickets yet</li>}
        </ul>
      </div>
    </div>
  );
}
