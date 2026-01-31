# Resume Screening & Auto Shortlisting Tool

A production-ready Resume Screening & Candidate Shortlisting Tool used by HR teams to automate the hiring process.

## 🚀 Features

- **Bulk Resume Upload:** Upload multiple PDF/DOCX resumes at once.
- **AI-Powered Parsing:** Automatically extracts skills, experience, and education.
- **Job Description Matching:** Scores candidates based on custom JD requirements.
- **Interactive Dashboard:** Rank and filter candidates with beautiful analytics.
- **Smart Shortlisting:** One-click shortlist and CSV export.
- **Modern UI:** Built with Next.js 15, Tailwind CSS, and Framer Motion.

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts.
- **Backend:** Node.js, Express.js, MongoDB, Multer, PDF-Parse, Mammoth.
- **Algorithm:** Keyword-based matching with weighted scoring (Skills 50%, Exp 30%, Edu 20%).

## 📦 Installation

### Backend

1. Navigate to `/backend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/resume-screener
   ```
4. Start the server: `npm start`

### Frontend

1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## 📊 Scoring Logic

- **Skills (50%):** Percentage of required skills found in the resume.
- **Experience (30%):** Matches reported experience against the minimum requirement.
- **Education (20%):** Checks for preferred degrees or educational background.

## 📄 Sample Resumes
Sample resumes can be found in the `samples` directory for testing.

---
Developed with ❤️ by Roshni Patel
