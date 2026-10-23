"use client";

import { useEffect, useRef } from "react";

// Sets a hidden timezone input to the browser's timezone after mount by writing
// directly to the DOM node (no state, so no cascading render).
export function TimezoneField({ defaultValue = "UTC" }: { defaultValue?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const guess = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (guess && inputRef.current) inputRef.current.value = guess;
    } catch {
      // keep the server-provided default
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="hidden"
      name="timezone"
      defaultValue={defaultValue}
    />
  );
}
