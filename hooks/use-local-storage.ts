"use client";

import { useCallback, useEffect, useState } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, boolean] => {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      setValue(initialValue);
    } finally {
      setHydrated(true);
    }
  }, [initialValue, key]);

  const updateValue = useCallback(
    (nextValue: T) => {
      setValue(nextValue);
      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      } catch {}
    },
    [key],
  );

  return [value, updateValue, hydrated];
};

export const removeLocalStorageValue = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {}
};
