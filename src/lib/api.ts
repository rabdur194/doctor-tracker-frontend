/**
 * API client for communicating with the Express backend
 * Uses fetch + JWT token from localStorage
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the auth token from localStorage
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Generic request helper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw error so components can catch it
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

// ========== Auth ==========
export const loginUser = (email: string, password: string) =>
  request<{ _id: string; name: string; email: string; token: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );

export const getMe = () => request<{ _id: string; name: string; email: string }>('/auth/me');

// ========== Doctors ==========
export const getDoctors = (params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return request<import('../types').DoctorsResponse>(`/doctors?${query}`);
};

export const getDoctorById = (id: string) =>
  request<import('../types').Doctor>(`/doctors/${id}`);

export const createDoctor = (data: {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}) =>
  request<import('../types').Doctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deleteDoctor = (id: string) =>
  request<{ message: string }>(`/doctors/${id}`, { method: 'DELETE' });

export const getDoctorPatients = (
  doctorId: string,
  params: Record<string, string | number> = {}
) => {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return request<{
    patients: import('../types').Patient[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    doctor: { _id: string; name: string };
  }>(`/doctors/${doctorId}/patients?${query}`);
};

export const addPatientToDoctor = (
  doctorId: string,
  data: {
    name: string;
    age: number;
    condition: string;
    phone: string;
    email?: string;
  }
) =>
  request<import('../types').Patient>(`/doctors/${doctorId}/patients`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const deletePatientFromDoctor = (doctorId: string, patientId: string) =>
  request<{ message: string }>(`/doctors/${doctorId}/patients/${patientId}`, {
    method: 'DELETE',
  });

// ========== Patients ==========
export const getPatients = (params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString();
  return request<import('../types').PatientsResponse>(`/patients?${query}`);
};

export const getPatientById = (id: string) =>
  request<import('../types').Patient>(`/patients/${id}`);

export const updatePatient = (
  id: string,
  data: Partial<{
    name: string;
    age: number;
    condition: string;
    phone: string;
    email: string;
    doctor: string;
  }>
) =>
  request<import('../types').Patient>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePatient = (id: string) =>
  request<{ message: string }>(`/patients/${id}`, { method: 'DELETE' });

// ========== Dashboard ==========
export const getDashboardStats = () =>
  request<import('../types').DashboardStats>('/dashboard');
