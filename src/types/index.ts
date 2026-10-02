export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age?: number;
  gender?: string;
  condition?: string;
  phone?: string;
  doctor: string | Doctor;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorsResponse extends PaginatedResponse {
  data?: Doctor[];
  doctors?: Doctor[];
}

export interface PatientsResponse extends PaginatedResponse {
  data?: Patient[];
  patients?: Patient[];
}

export interface DashboardStats {
  totals?: {
    doctors: number;
    patients: number;
  };
  totalDoctors?: number;
  totalPatients?: number;
  patientsPerDoctor: {
    doctorId?: string;
    doctorName: string;
    count?: number;
    patientCount?: number;
  }[];
  topConditions?: {
    condition: string;
    count: number;
  }[];
  conditionStats?: {
    _id: string;
    count: number;
  }[];
  activity?: {
    date: string;
    count: number;
  }[];
  patientsByDate?: { _id: string; count: number }[];
  doctorsByDate?: { _id: string; count: number }[];
}
