export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "contributor" | "viewer";
  status: "active" | "pending" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchUsers(token: string): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/api/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createUser(
  token: string,
  data: { email: string; name: string; role: string },
): Promise<ApiUser> {
  const res = await fetch(`${API_BASE}/api/user`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateUser(
  token: string,
  id: string,
  data: Partial<{ name: string; role: string; status: string }>,
): Promise<ApiUser> {
  const res = await fetch(`${API_BASE}/api/user/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeUser(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/user/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}
