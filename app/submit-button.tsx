// src/app/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "bg-emerald-600 text-white font-black px-5 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}
