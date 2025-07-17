// API utilities for API key management

export async function fetchApiKeys(token: string) {
  const res = await fetch('/api/apikey', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createApiKey(token: string, name: string, permissions: string[]) {
  const res = await fetch('/api/apikey', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, permissions })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteApiKey(token: string, id: string) {
  const res = await fetch(`/api/apikey/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function regenerateApiKey(token: string, id: string) {
  const res = await fetch(`/api/apikey/${id}/regenerate`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
