# ApnaHelper: Professional Home Services Marketplace

ApnaHelper is a comprehensive, real-time marketplace designed to bridge the gap between homeowners and skilled service professionals. By leveraging AI for job clarity and Firestore for instant updates, it provides a seamless experience for finding, bidding on, and completing home maintenance tasks.

## 🚀 Project Overview
ApnaHelper is built to modernize the local service industry. It replaces fragmented communication with a structured platform where quality is verified, pricing is transparent through a bidding system, and administration is data-driven.

## 💡 Problem Solving & Purpose
**The Problem:** Homeowners often struggle to describe technical issues (like plumbing leaks or electrical faults) accurately, leading to incorrect quotes and wasted time. Additionally, finding trusted professionals in a specific locality can be difficult and lacks transparency.

**The Solution:** 
- **AI-Powered Clarity:** An integrated AI Assistant (powered by Google Gemini) helps customers refine their job descriptions by asking clarifying questions before the job is even posted.
- **Transparent Bidding:** Instead of fixed prices, workers compete for jobs with custom quotes, ensuring the market determines the best value.
- **Localized Discovery:** Workers automatically see jobs relevant to their registered State, ensuring local experts help local people.

## 👥 User Roles & Functions

### 1. Customer (Homeowner)
*   **AI Job Assistant:** Refines vague descriptions into professional service requests.
*   **Bidding Management:** Receives and compares multiple quotes from different professionals.
*   **Real-time Tracking:** Monitors job progress from "Pending" to "Completed."
*   **Provider Verification:** Accesses worker profiles and professional bios before selection.
*   **Feedback Loop:** Rates the service and leaves feedback to maintain quality.

### 2. Worker (Service Professional)
*   **Job Discovery:** Scans a live feed of "Pending" jobs within their specific State.
*   **Custom Bidding:** Sends price offers and professional messages to secure jobs.
*   **Client Coordination:** Gains access to contact details and exact location only after a quote is accepted.
*   **Earnings Analytics:** Tracks lifetime revenue and monthly income trends via a dedicated dashboard.

### 3. System Administrator
*   **User Oversight:** Real-time management to verify, activate, or ban accounts for platform safety.
*   **Platform Analytics:** Monitors total users, job volume, and platform revenue.
*   **Support Resolution:** Manages and resolves user-reported queries and support tickets.
*   **Demand Analysis:** Identifies high-demand service categories through data visualization.

## 🔄 Workflow
1.  **Registration:** Users join as either a Customer or a Service Provider.
2.  **Request Creation:** A Customer describes a problem; the AI Assistant refines it for technical accuracy.
3.  **Bidding Phase:** Local Workers view the request and submit custom price quotes.
4.  **Selection:** The Customer accepts a quote, assigning the worker and locking the cost.
5.  **Execution:** The Worker updates the job status (Accepted -> In Progress -> Completed).
6.  **Closure:** Both parties exchange ratings, and the Worker's earnings are updated.

## 🛠️ Core Modules
*   **AI Orchestration:** Powered by Genkit and Gemini 2.5 Flash for intelligent text refinement.
*   **Real-time Sync:** Firestore-backed dashboards that update instantly without page refreshes.
*   **Admin Intelligence:** Recharts-driven analytics for tracking platform growth and financials.
*   **Authentication:** Robust Firebase Auth with domain-restricted auto-promotion for Admin roles (`@techveda.com`).

## 🏗️ System Architecture
*   **Frontend Layer:** Next.js 15 (App Router) with React 19 for a performant, SEO-friendly UI.
*   **Styling Layer:** Tailwind CSS for responsive design and Shadcn UI for consistent, accessible components.
*   **Backend Layer:** Firebase Firestore (NoSQL) for high-speed, real-time data persistence.
*   **AI Layer:** Genkit Framework for managing LLM prompts and flows.
*   **Security Layer:** Firestore Security Rules ensuring data privacy (e.g., Workers only see client addresses after job acceptance).

## 💻 Tech Stack
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Backend:** Firebase (Auth, Firestore)
- **AI Platform:** Google Genkit + Gemini AI
- **UI Components:** Shadcn UI + Lucide Icons
- **Charts:** Recharts

---

## 🛠️ Getting Started Locally

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
GOOGLE_GENAI_API_KEY="your_gemini_key"
```

### 3. Run Development
```bash
npm run dev
```
The app will be available at [http://localhost:9002](http://localhost:9002).

---
© 2026 **TechVeda**. Developed by **Nilesh Pal**.