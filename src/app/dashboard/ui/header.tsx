import LogoutButton from "./logout-button";

export default function Header({
  user,
}: {
  user: { username: string; userId?: string };
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could be added here in the future */}
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-semibold text-slate-900">
            {user.username}
          </span>
          <span className="text-xs text-slate-500">Administrator</span>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
        <LogoutButton />
      </div>
    </header>
  );
}
