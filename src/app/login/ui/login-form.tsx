"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-500"
    >
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.505 4.505 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 20.5a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-500"
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A1.5 1.5 0 0 1 19 12.5v7A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-7A1.5 1.5 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 15v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Login failed.");
        setIsLoading(false);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        startTransition(() => {
          router.push("/dashboard");
          router.refresh();
        });
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/90">
            Username
          </span>
          <div className="group relative flex items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-400 hover:ring-black/10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 transition-colors group-focus-within:text-teal-700">
              <UserIcon />
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your username"
              className="w-full bg-transparent py-3.5 pl-11 pr-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/90">
            Password
          </span>
          <div className="group relative flex items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 focus-within:ring-2 focus-within:ring-teal-400 hover:ring-black/10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 transition-colors group-focus-within:text-teal-700">
              <LockIcon />
            </div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-transparent py-3.5 pl-11 pr-12 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              type="button"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() => setIsPasswordVisible((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 transition-colors hover:text-zinc-600"
            >
              {isPasswordVisible ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 4l16 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </label>
      </div>

      {error ? (
        <p className="text-center text-sm font-medium text-red-500">{error}</p>
      ) : (
        <div aria-hidden="true" className="h-5" />
      )}

      <button
        disabled={isLoading || isPending}
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[15px] font-semibold tracking-wide text-teal-800 shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:bg-zinc-50 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:opacity-80 disabled:hover:-translate-y-0 disabled:hover:shadow-md"
      >
        {isLoading || isPending ? (
          <>
            <SpinnerIcon />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>

    {/* Success Modal - Full Page */}
    {showSuccess && (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 p-4 transition-opacity animate-in fade-in duration-500">
        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckIcon />
          </div>
          <h3 className="pb-2 text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text">Login Successful</h3>
          <p className="mt-2 text-center text-lg text-slate-500">Redirecting to your dashboard...</p>
          
          <div className="mt-10 flex justify-center gap-2">
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600"></div>
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600 delay-150"></div>
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600 delay-300"></div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
