"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import AppLayout from "@/components/AppLayout";
import Pagination from "@/components/Pagination";
import {
  getPatients,
  updatePatient,
  deletePatient,
  getDoctors,
} from "@/lib/api";
import type { Patient, Doctor } from "@/types";
import { Search, Pencil, Trash2, X } from "lucide-react";

/**
 * Dedicated Patients page - list, edit, delete, search, filter, pagination
 */
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit modal
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    condition: "",
    phone: "",
    email: "",
    doctor: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPatients({
        page,
        limit: 10,
        search,
        condition,
        startDate,
        endDate,
      });
      setPatients(data.patients);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load patients";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, condition, startDate, endDate]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [search, condition, startDate, endDate]);

  // Load doctors list for the edit dropdown
  useEffect(() => {
    getDoctors({ limit: 100 })
      .then((d) => setDoctors(d.doctors))
      .catch(() => {});
  }, []);

  const openEdit = (p: Patient) => {
    setEditPatient(p);
    const doctorId = typeof p.doctor === "object" ? p.doctor._id : p.doctor;
    setForm({
      name: p.name,
      age: String(p.age),
      condition: p.condition,
      phone: p.phone,
      email: p.email || "",
      doctor: doctorId,
    });
    setFormError("");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;
    setFormError("");
    setSubmitting(true);
    try {
      await updatePatient(editPatient._id, {
        name: form.name,
        age: Number(form.age),
        condition: form.condition,
        phone: form.phone,
        email: form.email || undefined,
        doctor: form.doctor,
      });
      setEditPatient(null);
      fetchPatients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Update failed";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete patient "${name}"?`)) return;
    try {
      await deletePatient(id);
      fetchPatients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      alert(message);
    }
  };

  const getDoctorName = (doctor: string | Doctor) => {
    if (typeof doctor === "object" && doctor !== null) {
      return doctor.name;
    }
    return "—";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">{total} patients total</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Filter by condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
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
          ) : patients.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No patients found
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
                      Age
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">
                      Condition
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                      Doctor
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
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="px-4 py-3">{p.age}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                          {p.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {getDoctorName(p.doctor)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {p.phone}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
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

      {/* Edit Modal */}
      {editPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Edit Patient</h2>
              <button
                onClick={() => setEditPatient(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition
                </label>
                <input
                  required
                  value={form.condition}
                  onChange={(e) =>
                    setForm({ ...form, condition: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Doctor</label>
                <select
                  required
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPatient(null)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
