/**
 * Shared TypeScript types for the Doctor Tracker app
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  condition: string;
  phone: string;
  email?: string;
  doctor: string | Doctor; // Can be id or populated object
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorsResponse extends PaginatedResponse<Doctor> {
  doctors: Doctor[];
}

export interface PatientsResponse extends PaginatedResponse<Patient> {
  patients: Patient[];
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientsPerDoctor: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }[];
  patientsByDate: { _id: string; count: number }[];
  doctorsByDate: { _id: string; count: number }[];
  conditionStats: { _id: string; count: number }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
