"use client";

import { useEffect } from "react";

const RELOAD_KEY = "chunk-load-recovery";

export const isChunkLoadError = (value: unknown) => {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === "string"
        ? value
        : "";

  if (!message) {
    return false;
  }

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("chunkloaderror") ||
    normalizedMessage.includes("loading chunk") ||
    normalizedMessage.includes("failed to fetch dynamically imported module") ||
    normalizedMessage.includes("/_next/static/chunks/")
  );
};

export const markChunkReload = (storage: Storage, reloadMarker: string) => {
  if (storage.getItem(RELOAD_KEY) === reloadMarker) {
    storage.removeItem(RELOAD_KEY);
    return false;
  }

  storage.setItem(RELOAD_KEY, reloadMarker);
  return true;
};

const reloadOnce = () => {
  const reloadMarker = `${window.location.pathname}${window.location.search}`;

  if (!markChunkReload(window.sessionStorage, reloadMarker)) {
    return;
  }
  window.location.reload();
};

export const ChunkLoadRecovery = () => {
  useEffect(() => {
    window.sessionStorage.removeItem(RELOAD_KEY);

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        reloadOnce();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
};
