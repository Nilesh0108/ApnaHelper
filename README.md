# ApnaHelper: Professional Home Services Marketplace

ApnaHelper is a professional platform connecting homeowners with verified service providers. Built with Next.js 15, Firebase, and Genkit AI.

## Getting Started Locally

### 1. Clone the repository
Download your project files to your local machine.

### 2. Install Dependencies
Open your terminal in the project root and run:
```bash
npm install
```

### 3. Environment Variables
Create a file named `.env.local` in the root directory and add your Firebase configuration and Gemini API Key:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID="studio-9550479999-b7a00"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1051327376907:web:8b696d0edb33875a7ce10e"
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBlvJxvKmtrvtD2oDSbALsOFMqsFOYA5cs"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="studio-9550479999-b7a00.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1051327376907"

# Genkit / Gemini AI (Get this from Google AI Studio)
GOOGLE_GENAI_API_KEY="your_api_key_here"
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (Shadcn UI).
- `src/firebase`: Firebase configuration and custom hooks.
- `src/ai`: Genkit AI flows and prompt definitions.
- `docs/backend.json`: Database schema and path definitions.

## Tech Stack
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Firebase (Auth & Firestore)
- **AI**: Genkit + Google Gemini
- **Icons**: Lucide React
