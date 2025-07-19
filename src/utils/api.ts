// Fetch uploaded files for the authenticated user
export async function fetchUploadedFiles(token: string): Promise<string[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/file/list`, {
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

export async function uploadFile(file: File, token: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/file/upload', {
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

// Generic fetch helper used by other API utilities
async function fetchJSON(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export function apiBase() {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
}

// Collections API
export async function fetchCollections(token: string) {
  return fetchJSON(`${apiBase()}/api/collections`, token);
}

// Gallery items API
export async function fetchGalleryItems(token: string) {
  return fetchJSON(`${apiBase()}/api/gallery`, token);
}

// Analytics API
export async function fetchAnalytics(token: string) {
  return fetchJSON(`${apiBase()}/api/analytics`, token);
}

// Archive API
export async function fetchArchives(token: string) {
  return fetchJSON(`${apiBase()}/api/archive`, token);
}

// Backup API
export async function fetchBackups(token: string) {
  return fetchJSON(`${apiBase()}/api/backups`, token);
}

// Users API
export async function fetchUsers(token: string) {
  return fetchJSON(`${apiBase()}/api/users`, token);
}
