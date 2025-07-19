const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export interface Collection {
  id: number;
  name: string;
  description: string;
  assetCount: number;
  isPublic: boolean;
  password?: string;
  createdAt: string;
  thumbnail: string;
  tags: string;
}

export async function fetchCollections(token: string): Promise<Collection[]> {
  const res = await fetch(`${API_URL}/api/Collections`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCollection(token: string, col: Omit<Collection, 'id'>): Promise<Collection> {
  const res = await fetch(`${API_URL}/api/Collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(col)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCollection(token: string, id: number, col: Omit<Collection, 'id'>): Promise<void> {
  const res = await fetch(`${API_URL}/api/Collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, ...col })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeCollection(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/Collections/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}
