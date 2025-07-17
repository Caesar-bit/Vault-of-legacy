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
