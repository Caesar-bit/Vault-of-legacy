const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5138';

export interface GalleryItem {
  id: number;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  date: string;
  location: string;
  views: number;
  likes: number;
  tags: string;
  featured: boolean;
  duration?: string;
}

export async function fetchGallery(token: string): Promise<GalleryItem[]> {
  const res = await fetch(`${API_URL}/api/GalleryItems`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createGalleryItem(token: string, item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const res = await fetch(`${API_URL}/api/GalleryItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateGalleryItem(token: string, id: number, item: Omit<GalleryItem, 'id'>): Promise<void> {
  const res = await fetch(`${API_URL}/api/GalleryItems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, ...item })
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeGalleryItem(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/GalleryItems/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
}
