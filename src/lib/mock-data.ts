
import { User, JobRequest, JobStatus } from './types';

// Mock state management using localStorage in a real-world app would use Firebase
// This ensures the demo is functional without a configured Firebase backend

const MOCK_USERS: User[] = [
  { id: 'u1', email: 'customer@test.com', name: 'Alice Smith', role: 'customer' },
  { id: 'u2', email: 'worker@test.com', name: 'Bob Johnson', role: 'worker' },
  { id: 'u3', email: 'admin@test.com', name: 'Admin User', role: 'admin' },
];

let mockJobs: JobRequest[] = [
  {
    id: 'j1',
    customerId: 'u1',
    customerName: 'Alice Smith',
    serviceType: 'Plumbing',
    description: 'Leaking kitchen faucet needs urgent repair.',
    status: 'open',
    createdAt: new Date().toISOString(),
    location: 'Downtown, Sector 5'
  },
  {
    id: 'j2',
    customerId: 'u1',
    customerName: 'Alice Smith',
    serviceType: 'Fan Repair',
    description: 'Ceiling fan making clicking noises and spinning slowly.',
    status: 'accepted',
    workerId: 'u2',
    workerName: 'Bob Johnson',
    createdAt: new Date().toISOString(),
    location: 'East Side, Block C'
  }
];

export const getSession = () => {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('homeserv_session');
  return session ? JSON.parse(session) as User : null;
};

export const loginUser = (email: string) => {
  const user = MOCK_USERS.find(u => u.email === email);
  if (user) {
    localStorage.setItem('homeserv_session', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem('homeserv_session');
};

export const getJobs = () => {
  const stored = localStorage.getItem('homeserv_jobs');
  if (stored) return JSON.parse(stored) as JobRequest[];
  localStorage.setItem('homeserv_jobs', JSON.stringify(mockJobs));
  return mockJobs;
};

export const createJob = (job: Partial<JobRequest>) => {
  const currentJobs = getJobs();
  const newJob: JobRequest = {
    id: Math.random().toString(36).substr(2, 9),
    customerId: job.customerId!,
    customerName: job.customerName!,
    serviceType: job.serviceType!,
    description: job.description!,
    refinedDescription: job.refinedDescription,
    status: 'open',
    createdAt: new Date().toISOString(),
    location: job.location || 'Springfield'
  };
  const updated = [...currentJobs, newJob];
  localStorage.setItem('homeserv_jobs', JSON.stringify(updated));
  return newJob;
};

export const updateJobStatus = (jobId: string, status: JobStatus, worker?: User) => {
  const currentJobs = getJobs();
  const updated = currentJobs.map(j => {
    if (j.id === jobId) {
      return { 
        ...j, 
        status, 
        workerId: worker ? worker.id : j.workerId,
        workerName: worker ? worker.name : j.workerName 
      };
    }
    return j;
  });
  localStorage.setItem('homeserv_jobs', JSON.stringify(updated));
  return updated;
};

export const getAllUsers = () => {
  const stored = localStorage.getItem('homeserv_users');
  if (stored) return JSON.parse(stored) as User[];
  localStorage.setItem('homeserv_users', JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

export const banUser = (userId: string) => {
  const users = getAllUsers();
  const updated = users.map(u => u.id === userId ? { ...u, isBanned: true } : u);
  localStorage.setItem('homeserv_users', JSON.stringify(updated));
  return updated;
};
