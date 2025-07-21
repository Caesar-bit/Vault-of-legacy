import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, saveUserData } from './api';

export function useUserData<T>(type: string, defaultValue: T) {
  const { token } = useAuth();
  const [data, internalSetData] = useState<T>(defaultValue);
  const [initialized, setInitialized] = useState(false);
  const hasLocalChanges = useRef(false);

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
        internalSetData((prev) => {
          if (hasLocalChanges.current) {
            return prev;
          }
          return (res as T) ?? defaultValue;
        });
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
    saveUserData(token, type, data)
      .then(() => {
        hasLocalChanges.current = false;
      })
      .catch(console.error);
  }, [token, type, data, initialized]);

  return [data, setData, initialized] as [
    T,
    React.Dispatch<React.SetStateAction<T>>,
    boolean
  ];
}
