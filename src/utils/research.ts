const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export interface ResearchItem {
  id: number;
  title: string;
  type: string;
  source: string;
  date: string;
  verified: boolean;
  reliability: string;
  notes: string;
  citations: string;
  tags: string;
}

export async function fetchResearch(token: string): Promise<ResearchItem[]> {
  const res = await fetch(`${API_URL}/api/ResearchItems`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createResearch(token: string, item: Omit<ResearchItem, 'id'>): Promise<ResearchItem> {
  const res = await fetch(`${API_URL}/api/ResearchItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateResearch(token: string, id: number, item: Omit<ResearchItem, 'id'>): Promise<void> {
  const res = await fetch(`${API_URL}/api/ResearchItems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, ...item })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeResearch(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/ResearchItems/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}
