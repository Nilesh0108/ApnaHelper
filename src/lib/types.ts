
export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBanned?: boolean;
}

export type JobStatus = 'open' | 'accepted' | 'in-progress' | 'completed';

export interface JobRequest {
  id: string;
  customerId: string;
  customerName: string;
  workerId?: string;
  workerName?: string;
  serviceType: string;
  description: string;
  refinedDescription?: string;
  status: JobStatus;
  createdAt: string;
  location: string;
}

export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'Fan Repair',
  'Cleaning',
  'Carpentry',
  'Painting'
];
