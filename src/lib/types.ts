
export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBanned?: boolean;
}

export type JobStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';

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
  createdAt: any;
  apartment: string;
  landmark: string;
  areaCityPincode: string;
  state: string;
  actualCost?: number;
  workerRating?: number;
  workerFeedback?: string;
  customerRating?: number;
  customerFeedback?: string;
}

export interface Quote {
  id: string;
  serviceRequestId: string;
  workerId: string;
  workerName: string;
  price: number;
  message?: string;
  createdAt: any;
}

export const SERVICE_TYPES = [
  'Plumbing',
  'Electrical',
  'Fan Repair',
  'Cleaning',
  'Carpentry',
  'Painting'
];

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
