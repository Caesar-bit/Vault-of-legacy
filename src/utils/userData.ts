import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, saveUserData } from './api';

export function useUserData<T>(type: string, defaultValue: T) {
  const { token } = useAuth();
  const [data, setData] = useState<T>(defaultValue);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!token) return;
    setInitialized(false);
    (async () => {
      try {
        const res = await getUserData(token, type);
        setData((res as T) ?? defaultValue);
      } catch (err) {
        console.error(err);
        setData(defaultValue);
      } finally {
        setInitialized(true);
      }
    })();
  }, [token, type]);

  useEffect(() => {
    if (!token || !initialized) return;
    saveUserData(token, type, data).catch(console.error);
  }, [token, type, data, initialized]);

  return [data, setData] as [T, React.Dispatch<React.SetStateAction<T>>];
}
