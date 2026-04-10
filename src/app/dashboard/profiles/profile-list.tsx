"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfile, setActiveProfile, deleteProfile } from "./actions";
import { Modal } from "../modal";
import { BudgetProfile } from "@prisma/client";

export function ProfileList({ 
  initialProfiles, 
  activeProfileId 
}: { 
  initialProfiles: BudgetProfile[], 
  activeProfileId?: string 
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<BudgetProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = async (id: string) => {
    setLoadingProfileId(id);
    const res = await setActiveProfile(id);
    setLoadingProfileId(null);
    if (res?.success) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleCreate = async (formData: FormData) => {
    setError(null);
    setIsSubmitting(true);
    const res = await createProfile(formData);
    setIsSubmitting(false);
    
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setIsModalOpen(false);
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    const res = await deleteProfile(profileToDelete.id);
    setIsDeleting(false);
    if (res?.success) {
      setProfileToDelete(null);
      router.refresh();
    } else {
      setError(res?.error || "Failed to delete profile");
    }
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create New Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex h-48 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-emerald-500 hover:bg-emerald-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="font-semibold text-slate-600 group-hover:text-emerald-700">Create New Profile</span>
        </button>

        {/* Existing Profiles */}
        {initialProfiles.map(p => {
          const isActive = p.id === activeProfileId;
          const isLoading = loadingProfileId === p.id;
          
          return (
            <div key={p.id} className="relative">
              <button
                onClick={() => handleSelect(p.id)}
                disabled={loadingProfileId !== null}
                className={`relative flex h-48 w-full flex-col items-start justify-between rounded-2xl border p-6 text-left transition-all ${
                  isActive 
                    ? "border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500" 
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
                } ${loadingProfileId !== null && !isLoading ? "opacity-50" : ""}`}
              >
                <div className="w-full pr-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-bold truncate ${isActive ? "text-emerald-900" : "text-slate-900"}`}>
                      {p.name}
                    </h3>
                    {isActive && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm line-clamp-3 ${isActive ? "text-emerald-700" : "text-slate-500"}`}>
                    {p.description || "No description provided."}
                  </p>
                </div>
                
                <div className="flex w-full items-center justify-between mt-4 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">Created {new Date(p.createdAt).toLocaleDateString()}</span>
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className={`text-sm font-semibold ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"}`}>
                      Select &rarr;
                    </span>
                  )}
                </div>
              </button>
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileToDelete(p);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                title="Delete Profile"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Budget Profile">
        <form action={handleCreate} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
              Profile Name (PaP)
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="e.g. FY 2026 Region 1"
                className="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900">
              Description (Optional)
            </label>
            <div className="mt-2">
              <textarea
                name="description"
                id="description"
                rows={3}
                placeholder="Brief description of this budget profile..."
                className="block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Profile"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Profile Modal */}
      <Modal isOpen={!!profileToDelete} onClose={() => setProfileToDelete(null)} title="Delete Profile" maxWidth="md" minHeight={false}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Delete {profileToDelete?.name}?</h3>
              <p className="text-sm text-slate-500 mt-1">This will permanently delete the profile, all its budgets, and all its transactions.</p>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setProfileToDelete(null)}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}