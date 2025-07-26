import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createTicket, fetchTickets, updateTicket, deleteTicket } from '../../utils/api';
import { SupportTicket } from '../../types';
import { MessageCircle, Plus, Edit2, Trash2, Eye } from 'lucide-react';
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

  const load = useCallback(() => {
    if (!token) return;
    fetchTickets(token).then(setTickets).catch(() => {});
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

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

  const startEdit = (t: SupportTicket) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description);
    setEditStatus(t.status);
  };

  const saveEdit = async () => {
    if (!token || !editingId) return;
    try {
      await updateTicket(token, editingId, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      setEditingId(null);
      setAlert('Ticket updated');
      load();
    } catch {
      setAlert('Failed to update ticket');
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await deleteTicket(token, id);
      setAlert('Ticket deleted');
      load();
    } catch {
      setAlert('Failed to delete');
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
            <li
              key={t.id}
              className="glassy-card border rounded-lg p-3 shadow-sm space-y-1"
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
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}
