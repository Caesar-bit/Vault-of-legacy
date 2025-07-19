// Fetch uploaded files for the authenticated user
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchUploadedFiles(token: string): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/file/list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch uploaded files');
  }
  return response.json();
}
// Utility for API calls with JWT support

export interface UploadedInfo {
  path: string;
  originalName: string;
}

export async function uploadFile(file: File, token: string): Promise<UploadedInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/file/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function fetchVaultStructure(token: string) {
  const res = await fetch(`${API_BASE}/api/file/structure`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveVaultStructure(token: string, data: unknown) {
  const res = await fetch(`${API_BASE}/api/file/structure`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}
