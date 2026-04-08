"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { SuccessModal } from "../ui/success-modal";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        "Save Changes"
      )}
    </button>
  );
}

export function SettingsForm({ initialUsername }: { initialUsername: string }) {
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  return (
    <>
      <form
        action={async (formData) => {
          setError(null);
          const res = await updateProfile(null, formData);
          if (res?.error) {
            setError(res.error);
          } else if (res?.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            
            // Clear password fields on success
            (document.getElementById("currentPassword") as HTMLInputElement).value = "";
            (document.getElementById("newPassword") as HTMLInputElement).value = "";
            (document.getElementById("confirmPassword") as HTMLInputElement).value = "";
            
            router.refresh();
          }
        }}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-semibold leading-7 text-slate-900">Profile Information</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update your account details.
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={initialUsername}
              required
              className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-5 pt-4">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-semibold leading-7 text-slate-900">Change Password</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Leave blank if you do not want to change your password.
            </p>
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>

      <SuccessModal 
        isOpen={showSuccess} 
        title="Profile Updated" 
        message="Your settings have been saved successfully." 
      />
    </>
  );
}