```md
### GramVaani

GramVaani is an AI-powered grievance redressal system that allows citizens to submit complaints through text or speech. The system converts multilingual speech into English text, analyzes the grievance, classifies it, and allows admins to view and manage submitted complaints.

## Features

- Citizen registration and login
- Admin login with role-based access
- Submit grievances through text
- Submit grievances through speech using Whisper
- Multilingual speech-to-English transcription
- AI-based grievance category and priority detection
- User dashboard to view submitted grievances
- Admin dashboard to view and manage all grievances
- Analytics and forecasting support

## Tech Stack

**Frontend**
- Next.js
- React
- Tailwind CSS
- Axios

**Backend**
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Faster Whisper

**AI/ML**
- Whisper / Faster Whisper for speech-to-text translation
- NLP-based grievance classification
- Forecasting and analytics modules

## Project Structure

```text
GramVaani/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── README.md
```

## Installation

### 1. Clone The Repository

```bash
git clone https://github.com/prakruthiprasad20/GramVaani.git
cd GramVaani
```

## Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux/Mac**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL=sqlite:///./igrs.db
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Swagger API docs:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:3000
```

## Admin Login

Use the hard-coded admin credentials:

```text
Email: admin123@gmail.com
Password: admin123
```

Admin can view and manage all grievances submitted by different users.

## User Flow

1. Register as a citizen.
2. Login as user.
3. Submit a grievance using text or speech.
4. Speech input is converted into English text using Whisper.
5. The grievance is classified and stored.
6. User can view their submitted grievances.

## Admin Flow

1. Login using admin credentials.
2. Open the admin dashboard.
3. View all complaints submitted by users.
4. Update grievance status if required.
5. View analytics and complaint trends.

## Speech-To-Text

GramVaani uses free local Whisper through `faster-whisper`.

Supported example languages:

```text
English
Hindi
Kannada
Tamil
Telugu
Malayalam
Marathi
Bengali
Urdu
Gujarati
```

The system translates supported speech input into English so that the grievance can be analyzed consistently.

## Important Notes

- Do not commit the `.env` file.
- Use `.env.example` to show required environment variables.
- SQLite database files such as `igrs.db` should not be pushed to GitHub.
- Admin signup is disabled for security. Admin access is handled through fixed credentials.

## Useful Commands

Run backend:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Run frontend:

```bash
cd frontend
npm run dev
```

Check backend API docs:

```text
http://127.0.0.1:8000/docs
```

## License

This project is created for academic mini-project purposes.
```

Before pushing, make sure your `.gitignore` has:

```gitignore
backend/.env
backend/*.db
backend/venv/
frontend/node_modules/
frontend/.next/
```

