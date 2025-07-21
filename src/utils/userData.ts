import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, saveUserData } from './api';

export function useUserData<T>(type: string, defaultValue: T) {
  const { token } = useAuth();
  const [data, internalSetData] = useState<T>(defaultValue);
  const [initialized, setInitialized] = useState(false);
  const hasLocalChanges = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const setData: typeof internalSetData = (value) => {
    hasLocalChanges.current = true;
    internalSetData(value);
  };

  useEffect(() => {
    if (!token) return;
    setInitialized(false);
    (async () => {
      try {
        const res = await getUserData(token, type);
        internalSetData((prev) =>
          hasLocalChanges.current ? prev : ((res as T) ?? defaultValue)
        );
        hasLocalChanges.current = false;
      } catch (err) {
        console.error(err);
        internalSetData((prev) => (hasLocalChanges.current ? prev : defaultValue));
      } finally {
        setInitialized(true);
      }
    })();
  }, [token, type]);

  useEffect(() => {
    if (!token || !initialized || !hasLocalChanges.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveUserData(token, type, data)
        .then(() => {
          hasLocalChanges.current = false;
          saveTimeout.current = null;
        })
        .catch(console.error);
    }, 1000);
  }, [token, type, data, initialized]);

  return [data, setData] as [T, React.Dispatch<React.SetStateAction<T>>];
}
