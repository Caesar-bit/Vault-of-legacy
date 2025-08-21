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

export async function saveVaultStructure(token: string, data: unknown, log = true) {
  const res = await fetch(`${API_BASE}/api/file/structure?log=${log}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_BASE}/api/account/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProfile(token: string, data: { name?: string; email?: string; avatar?: string }) {
  const res = await fetch(`${API_BASE}/api/account/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function changePassword(token: string, currentPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/api/account/password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getRecentActivity(token: string) {
  const res = await fetch(`${API_BASE}/api/activity/recent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function clearRecentActivity(token: string) {
  const res = await fetch(`${API_BASE}/api/activity/recent`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function setVaultPin(token: string, newPin: string, currentPin?: string) {
  const res = await fetch(`${API_BASE}/api/account/pin`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPin, newPin }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeVaultPin(token: string, pin: string) {
  const res = await fetch(`${API_BASE}/api/account/pin`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function verifyVaultPin(token: string, pin: string) {
  const res = await fetch(`${API_BASE}/api/account/pin/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error(await res.text());
}


export async function getUserData(token: string, type: string) {
  const res = await fetch(`${API_BASE}/api/userdata/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveUserData(
  token: string,
  type: string,
  data: unknown,
  log = false
) {
  const res = await fetch(`${API_BASE}/api/userdata/${type}?log=${log}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getStats(token: string) {
  const res = await fetch(`${API_BASE}/api/stats/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAssetBreakdown(token: string) {
  const res = await fetch(`${API_BASE}/api/stats/assets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchChatHistory(token: string) {
  const res = await fetch(`${API_BASE}/api/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchFaqs(token: string) {
  const res = await fetch(`${API_BASE}/api/chat/faqs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTrustees(token: string) {
  const res = await fetch(`${API_BASE}/api/trustees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addTrustee(token: string, data: { name: string; email: string; tier: string }) {
  const res = await fetch(`${API_BASE}/api/trustees`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeTrustee(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/trustees/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateTrustee(
  token: string,
  id: string,
  data: { name?: string; email?: string; tier?: string }
) {
  const res = await fetch(`${API_BASE}/api/trustees/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function verifyTrustee(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/trustees/${id}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchBeneficiaries(token: string) {
  const res = await fetch(`${API_BASE}/api/beneficiaries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addBeneficiary(
  token: string,
  data: { name: string; email: string; phone: string; relationship: string }
) {
  const res = await fetch(`${API_BASE}/api/beneficiaries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateBeneficiary(
  token: string,
  id: string,
  data: { name?: string; email?: string; phone?: string; relationship?: string }
) {
  const res = await fetch(`${API_BASE}/api/beneficiaries/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeBeneficiary(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/beneficiaries/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function verifyBeneficiary(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/beneficiaries/${id}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchReleases(token: string) {
  const res = await fetch(`${API_BASE}/api/releases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addRelease(token: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/releases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function triggerRelease(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/releases/${id}/trigger`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchTickets(token: string) {
  const res = await fetch(`${API_BASE}/api/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTicket(
  token: string,
  data: { title: string; description: string }
) {
  const res = await fetch(`${API_BASE}/api/tickets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTicket(
  token: string,
  id: string,
  data: { title?: string; description?: string; status?: string }
) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTicket(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchApiEndpoints(token: string) {
  const res = await fetch(`${API_BASE}/api/info/routes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
