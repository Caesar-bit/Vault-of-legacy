import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { createTicket, fetchTickets, updateTicket, deleteTicket } from '../../utils/api';
import { SupportTicket } from '../../types';
import {
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Ticket,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedAlert } from '../AnimatedAlert';

export function SupportPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('open');
  const connectionRef = useRef<HubConnection | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    fetchTickets(token).then(setTickets).catch(() => {});
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/tickets', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('TicketCreated', (t: SupportTicket) =>
      setTickets((prev) => [t, ...prev])
    );
    connection.on('TicketUpdated', (t: SupportTicket) =>
      setTickets((prev) => prev.map((p) => (p.id === t.id ? t : p)))
    );
    connection.on('TicketDeleted', (id: string) =>
      setTickets((prev) => prev.filter((p) => p.id !== id))
    );
    connection
      .start()
      .catch(() => {});
    connectionRef.current = connection;
    return () => {
      connection.stop();
    };
  }, [token]);

  const submit = async () => {
    if (!token || !title.trim() || !description.trim()) return;
    try {
      const created = await createTicket(token, { title, description });
      setTickets((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setAlert('Ticket created');
    } catch {
      setAlert('Failed to create ticket');
    }
  };

  const startEdit = (t: SupportTicket) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description);
    setEditStatus(t.status);
  };

  const saveEdit = async () => {
    if (!token || !editingId) return;
    try {
      const updated = await updateTicket(token, editingId, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null);
      setAlert('Ticket updated');
    } catch {
      setAlert('Failed to update ticket');
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await deleteTicket(token, id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setAlert('Ticket deleted');
    } catch {
      setAlert('Failed to delete');
    }
  };

  const ticketStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) {
      counts[t.status] = (counts[t.status] || 0) + 1;
    }
    const open = counts['open'] || 0;
    const closed = counts['closed'] || 0;
    return {
      total: tickets.length,
      open,
      closed,
      other: tickets.length - open - closed,
      byStatus: counts,
    };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-6"
              >
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Support
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 max-w-2xl mx-auto"
              >
                Create tickets and review your requests
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Ticket, label: 'Total', value: ticketStats.total, color: 'from-blue-500 to-blue-600' },
            { icon: Circle, label: 'Open', value: ticketStats.open, color: 'from-indigo-500 to-indigo-600' },
            { icon: CheckCircle2, label: 'Closed', value: ticketStats.closed, color: 'from-green-500 to-green-600' },
            { icon: AlertCircle, label: 'Other', value: ticketStats.other, color: 'from-yellow-500 to-yellow-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 space-y-4">
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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
          <h2 className="text-lg font-semibold mb-2">My Tickets</h2>
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="border rounded-lg p-3 shadow-sm space-y-1 bg-white/70"
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === t.id ? null : t.id)
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {t.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {t.status} - {new Date(t.createdAt).toLocaleString()}
                </div>
                {(expandedId === t.id || editingId === t.id) && (
                  <div className="mt-2 space-y-2">
                    {editingId === t.id ? (
                      <>
                        <input
                          className="border rounded w-full p-1"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                        <textarea
                          className="border rounded w-full p-1"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <select
                          className="border rounded w-full p-1"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-200 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm">{t.description}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
            {tickets.length === 0 && <li>No tickets yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
