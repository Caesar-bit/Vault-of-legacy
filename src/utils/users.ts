export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  lastLogin: string | null;
  joinDate: string;
  permissions: string[];
  avatar: string;
}

const STORAGE_KEY = 'vault_users';

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function fetchUsers(): Promise<StoredUser[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(readUsers());
    }, 300);
  });
}

export async function createUser(user: StoredUser): Promise<StoredUser> {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = readUsers();
      users.unshift(user);
      writeUsers(users);
      resolve(user);
    }, 300);
  });
}

export async function updateUser(id: string, data: Partial<StoredUser>): Promise<StoredUser | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = readUsers();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        resolve(null);
        return;
      }
      users[index] = { ...users[index], ...data };
      writeUsers(users);
      resolve(users[index]);
    }, 300);
  });
}

export async function removeUser(id: string): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const users = readUsers().filter(u => u.id !== id);
      writeUsers(users);
      resolve();
    }, 300);
  });
}
