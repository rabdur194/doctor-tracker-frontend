'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Pagination from '@/components/Pagination';
import {
  getDoctorById,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
} from '@/lib/api';
import type { Doctor, Patient } from '@/types';
import { ArrowLeft, Plus, Trash2, X, Search } from 'lucide-react';

/**
 * Doctor detail page - view & manage patients under this doctor
 */
export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add patient modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    condition: '',
    phone: '',
    email: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [doc, patientData] = await Promise.all([
        getDoctorById(doctorId),
        getDoctorPatients(doctorId, { page, limit: 10, search }),
      ]);
      setDoctor(doc);
      setPatients(patientData.patients);
      setTotalPages(patientData.totalPages);
      setTotal(patientData.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [doctorId, page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAddPatient = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await addPatientToDoctor(doctorId, {
        name: form.name,
        age: Number(form.age),
        condition: form.condition,
        phone: form.phone,
        email: form.email || undefined,
      });
      setShowModal(false);
      setForm({ name: '', age: '', condition: '', phone: '', email: '' });
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId: string, name: string) => {
    if (!confirm(`Remove patient "${name}" from this doctor?`)) return;
    try {
      await deletePatientFromDoctor(doctorId, patientId);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && !doctor) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error && !doctor) {
    return (
      <AppLayout>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
          Go back
        </button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </Link>
          {doctor && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  {doctor.specialization}
                </span>
                <span>{doctor.hospital}</span>
                <span>{doctor.phone}</span>
                <span>{doctor.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Patients section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Patients ({total})
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Patients table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No patients yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Age</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Condition</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Phone</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.age}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                          {p.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeletePatient(p._id, p.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">Add Patient</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{formError}</div>
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
                <label className="block text-sm font-medium mb-1">Condition</label>
                <input
                  required
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
