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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil((initialProfiles.length + 1) / itemsPerPage); // +1 for the "Create New" card
  const allItems = [{ isCreateCard: true }, ...initialProfiles];
  const paginatedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        {paginatedItems.map((item, index) => {
          if ('isCreateCard' in item) {
            return (
              <button
                key="create-new"
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
            );
          }

          const p = item as BudgetProfile;
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

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500">
            Showing page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Profile" maxWidth="md" minHeight={false}>
        <form action={handleCreate} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
              <svg className="h-5 w-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Profile Name (PaP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="e.g. FY 2026 Region 1"
                className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">A unique name to identify this program or project budget.</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold leading-6 text-slate-900 mb-1">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Brief description of this budget profile..."
              className="block w-full rounded-xl border-0 py-3 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all resize-none"
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-70 transition-all"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : "Create Profile"}
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