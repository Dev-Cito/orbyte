"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";

export type Resource<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: unknown };

// Loads data in the browser, with explicit loading / success / error states
// and a reload() that keeps showing the current data until the new one
// arrives (no flash back to a skeleton). Reloads again when `key` changes.
export function useResource<T>(
  key: string,
  load: () => Promise<T>,
): Resource<T> & { reload: () => void } {
  const [state, setState] = useState<Resource<T>>({ status: "loading" });
  const [version, setVersion] = useState(0);
  const run = useEffectEvent(load);

  useEffect(() => {
    let current = true;
    run().then(
      (data) => current && setState({ status: "success", data }),
      (error: unknown) => current && setState({ status: "error", error }),
    );
    // A response for an older key or version is dropped.
    return () => {
      current = false;
    };
  }, [key, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
