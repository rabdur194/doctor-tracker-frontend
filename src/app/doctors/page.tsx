"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import Pagination from "@/components/Pagination";
import { getDoctors, createDoctor, deleteDoctor } from "@/lib/api";
import type { Doctor } from "@/types";
import { Plus, Search, Trash2, Eye, X } from "lucide-react";

/**
 * Doctors list page - search, filter, pagination, create
 */
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    hospital: "",
    phone: "",
    email: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDoctors({
        page,
        limit: 10,
        search,
        specialization,
        startDate,
        endDate,
      });
      setDoctors(data.doctors);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load doctors";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, specialization, startDate, endDate]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, specialization, startDate, endDate]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createDoctor(form);
      setShowModal(false);
      setForm({
        name: "",
        specialization: "",
        hospital: "",
        phone: "",
        email: "",
      });
      fetchDoctors();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create doctor";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete doctor "${name}" and all their patients?`)) return;
    try {
      await deleteDoctor(id);
      fetchDoctors();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete doctor";
      alert(message);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
            <p className="text-slate-500 text-sm mt-1">{total} doctors total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Filter by specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              title="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              title="End date"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No doctors found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      Specialization
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                      Hospital
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">
                      Created
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {doc.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {doc.specialization}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {doc.hospital}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {doc.phone}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="View patients"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(doc._id, doc.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Create Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Add New Doctor</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                  {formError}
                </div>
              )}
              {(
                [
                  "name",
                  "specialization",
                  "hospital",
                  "phone",
                  "email",
                ] as const
              ).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    required
                    value={form[field]}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
