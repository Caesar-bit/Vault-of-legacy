const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export interface StoredUser {
  id: number;
  userName: string;
  email: string;
}

export async function fetchUsers(token: string): Promise<StoredUser[]> {
  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.map((u: string, index: number) => ({ id: index, userName: u, email: '' }));
}

export async function createUser(token: string, user: { userName: string; email: string; password: string }): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateUser(token: string, id: number, user: { userName: string; email: string; password?: string }): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeUser(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}
