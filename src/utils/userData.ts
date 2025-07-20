import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, saveUserData } from './api';

export function useUserData<T>(type: string, defaultValue: T) {
  const { token } = useAuth();
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await getUserData(token, type);
        setData(res as T);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token, type]);

  useEffect(() => {
    if (!token) return;
    saveUserData(token, type, data).catch(console.error);
  }, [token, type, data]);

  return [data, setData] as [T, React.Dispatch<React.SetStateAction<T>>];
}
