# VideoTranslator



How to Use
Click "Upload" and select an MP4 video

Choose your target language

Wait a moment while we process

View your translated transcript!


# Backend
cd backend
python -m venv venv
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
Environment Variables:
Create .env files with:

# backend/.env
OPENAI_API_KEY=your_key_here

# frontend/.env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

