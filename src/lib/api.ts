// API Client - Talks to our Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Get the saved JWT token from browser storage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Main request function

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// AUTH APIs

export function loginUser(email: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request("/auth/me");
}

// DOCTOR APIs

export function getDoctors(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();

  return request(`/doctors?${query}`);
}

export function getDoctorById(id: string) {
  return request(`/doctors/${id}`);
}

export function createDoctor(data: {
  name: string;
  specialization: string;
  hospital: string;
  phone?: string;
  email?: string;
}) {
  return request("/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteDoctor(id: string) {
  return request(`/doctors/${id}`, {
    method: "DELETE",
  });
}

export function getDoctorPatients(
  doctorId: string,
  params: Record<string, string | number> = {},
) {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();

  return request(`/doctors/${doctorId}/patients?${query}`);
}

// PATIENT APIs

export function getPatients(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();

  return request(`/patients?${query}`);
}

export function createPatient(data: {
  name: string;
  age?: number;
  gender?: string;
  condition?: string;
  phone?: string;
  doctor: string;
}) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePatient(
  id: string,
  data: {
    name?: string;
    age?: number;
    gender?: string;
    condition?: string;
    phone?: string;
    doctor?: string;
  },
) {
  return request(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deletePatient(id: string) {
  return request(`/patients/${id}`, {
    method: "DELETE",
  });
}

// DASHBOARD API

export function getDashboardStats() {
  return request("/dashboard");
}
