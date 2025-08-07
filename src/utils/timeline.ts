const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  type: string;
  location: string;
}

export async function fetchEvents(token: string): Promise<TimelineEvent[]> {
  const res = await fetch(`${API_URL}/api/TimelineEvents`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createEvent(token: string, ev: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
  const res = await fetch(`${API_URL}/api/TimelineEvents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(ev)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateEvent(token: string, id: number, ev: Omit<TimelineEvent, 'id'>): Promise<void> {
  const res = await fetch(`${API_URL}/api/TimelineEvents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, ...ev })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeEvent(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/TimelineEvents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}
