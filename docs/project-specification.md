# HomeServ Connect: Full System Specification & Prompt

This document serves as a complete blueprint to recreate or extend the "HomeServ Connect" platform. It encompasses the architecture, user workflows, security models, and AI integration patterns.

## 1. Project Overview
**Tech Veda HomeServ Connect** is a professional marketplace connecting homeowners (Customers) with verified service providers (Workers) for tasks like plumbing, electrical work, and carpentry. It features a system-wide administrative layer for monitoring platform health and user safety.

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19.
- **Styling**: Tailwind CSS & ShadCN UI.
- **Database & Auth**: Firebase (Firestore for real-time data, Firebase Auth for security).
- **AI**: Genkit with Google Gemini 2.5 Flash for job description refinement.
- **Icons**: Lucide-React.

---

## 2. User Roles & Workflows

### A. Customer Workflow
1. **Registration/Login**: Public signup. Ability to update professional profile including address and contact info.
2. **Post Job Request**:
   - Select service type (Plumbing, Electrical, etc.).
   - Use **AI Job Assistant** to refine descriptions based on industry-specific clarifying questions.
   - Set location details.
3. **Manage Requests**:
   - View active requests on a dynamic dashboard.
   - **Bidding System**: View multiple quotes sent by workers.
   - **Selection**: Accept a quote, which assigns the worker and locks in the price.
   - **Tracking**: Real-time progress bar (Pending -> Assigned -> In Progress -> Completed).
   - **Profile Access**: View the assigned worker's professional bio and contact details.
   - **Feedback**: Rate the worker and leave feedback upon completion.
4. **History**: Filter past jobs by year and review performance.

### B. Worker Workflow
1. **Registration**: Signup as a "Service Provider".
2. **Job Discovery**: 
   - Dashboard automatically scans for "PENDING" jobs within the worker's registered **State**.
3. **Bidding**:
   - Send custom quotes (Price + Message) for available jobs.
4. **Execution**:
   - Once "Accepted", gain access to the Customer’s phone, email, and exact address.
   - Update job status to "IN_PROGRESS" upon arrival.
   - Mark as "COMPLETED" to close the ticket.
5. **Earnings**: Real-time revenue analytics dashboard showing lifetime earnings and monthly trends.
6. **Feedback**: Rate the customer (private feedback) to maintain platform quality.

### C. System Administrator Workflow
1. **Access**: Domain-restricted access (emails ending in `@techveda.com` are auto-promoted to Admin).
2. **Dashboard**:
   - **Analytics**: Total users, total jobs, active vs. completed tasks.
   - **User Management**: Real-time table to verify, ban, or reactivate user accounts.
   - **Recent Activity**: Live feed of the latest job postings.
3. **Intelligence/Reports**:
   - **Service Demand**: Pie charts showing which categories are most popular.
   - **Platform Velocity**: Line charts tracking job volume over the last 7 days.
   - **Financials**: Total transacted revenue and average customer satisfaction.

---

## 3. Core Features & UI/UX
- **Dark/Light Mode**: Full system-wide support using `next-themes` with a professional blue/teal palette.
- **Responsiveness**: Mobile-first design with a dedicated sidebar/navbar for easy navigation.
- **Real-time Synchronization**: Powered by Firestore `onSnapshot` for instant updates across all dashboards.
- **AI Integration**: Custom Genkit flow that acts as a "Service Expert" to help customers avoid ambiguous job postings.

---

## 4. Database Schema (Firestore)
- `/users/{userId}`: UserProfiles (Role, Status, Bio, Address).
- `/service_requests/{requestId}`: Main job data (Status, Location, Assigned Worker).
- `/service_requests/{requestId}/quotes/{quoteId}`: Worker bids.
- `/reports/{reportId}`: Customer support tickets.

---

## 5. Security Model (Security Rules)
- **Profiles**: Authenticated users can `get` any profile (for contact info), but only owners can `update`.
- **Jobs**: Customers can only `create` for themselves. Workers can `update` jobs only if they are assigned.
- **Admin**: Full `list` access to all users and job reports. Domain-level check `role == 'admin'` enforced at the database level.
