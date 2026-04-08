import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./ui/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative flex flex-1 items-center overflow-hidden bg-slate-50 p-6">
      <div className="pointer-events-none absolute left-0 top-[45%] flex w-full -translate-x-48 -translate-y-1/2 items-center justify-center">
        <div className="relative h-[860px] w-[860px] opacity-10 blur-[0.6px] [transform:perspective(1200px)_rotateX(22deg)_rotateY(198deg)]">
          <Image
            src="/DENR_LOGO.png"
            alt=""
            fill
            sizes="860px"
            className="object-contain drop-shadow-[0_26px_60px_rgba(0,0,0,0.35)]"
            priority
          />
        </div>
      </div>

      {/* Subtle animated grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.45]">
        <div className="absolute inset-0 h-[200%] w-full animate-grid-flow bg-[linear-gradient(to_right,#062D35_1px,transparent_1px),linear-gradient(to_bottom,#062D35_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-end gap-12">
        <div className="hidden flex-1 sm:flex sm:justify-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-[#062D35] shadow-sm ring-1 ring-black/5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              DENR CAR
            </div>
            <h1 className="mt-5 pb-1 text-5xl font-extrabold leading-[1.12] tracking-tight text-transparent [text-wrap:balance] bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 bg-clip-text drop-shadow-[0_10px_28px_rgba(6,45,53,0.25)]">
              DENR Cashflow System
            </h1>
            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600" />
            <p className="mt-5 text-base leading-7 text-zinc-700">
              Secure access for cashflow tracking and reporting.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700 shadow-[0_8px_40px_rgba(4,116,129,0.3)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(4,116,129,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/0 to-black/10" />
          <div className="relative px-10 py-12 sm:px-12 sm:py-14">
            <h2 className="text-center text-2xl font-bold tracking-tight text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-white/80">
              Please enter your details to sign in.
            </p>
            <div className="mt-10">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
