# VedAI Assessment Creator 🚀

VedAI is an AI-powered structured assessment and question paper generator designed for teachers and educators. It enables users to customize, structure, and generate pristine, curriculum-standard question papers (such as NCERT style) along with corresponding answer keys using Google Gemini AI.

---

## 🌟 Key Features

*   **AI-Powered Paper Generation**: Generates standard questions, distributes difficulty levels, and compiles structured answer sheets instantly using the Gemini API.
*   **Custom Section Layouts**: Dynamically customize total questions, marks, and specific question types (MCQ, Short Answer, Long Answer) per section.
*   **Option-Based Selection (Compulsory Questions)**: Define how many questions are compulsory in each section (e.g. *"Attempt any 4 out of 5 questions"*), automatically factoring into the total marks calculation.
*   **Difficulty tagging**: Every question carries dynamic difficulty pill tags (Easy, Moderate, Hard) rendered seamlessly alongside their marks.
*   **Real-time WebSocket Pipeline**: Employs a robust Redis and BullMQ backend worker queue to compile prompts asynchronously, reporting progress live to the user via WebSockets.
*   **Pristine PDF Prints**: Exports high-fidelity, printable PDF question papers containing customized sections, exam rules, and student details. Navigation bars, FAB buttons, and headers are fully isolated and omitted from prints automatically.
*   **Dual-Responsive View**: Premium-grade mobile view with a custom floating capsule navigation bar, floating action buttons, and white card grid structures.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: Next.js 16 (React 19 & TypeScript)
*   **State Management**: Zustand
*   **Icons**: Lucide React
*   **Styling**: Vanilla CSS & TailwindCSS (PostCSS v4)

### Backend
*   **Runtime**: Node.js & Express (TypeScript)
*   **Job Queue**: BullMQ (Task Queue Manager) & Redis
*   **Database**: MongoDB & Mongoose ORM
*   **WebSockets**: Real-time progress updates via `ws`

### AI Integration
*   **AI Core**: Google Gemini Generative AI SDK (`@google/generative-ai`)

---

## 💻 Local Setup Guide

You can run the entire VedAI suite locally either directly on your machine or in an isolated Docker environment.

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
*   [Docker](https://www.docker.com/) (Required for Docker Compose setup)
*   [Redis](https://redis.io/) & [MongoDB](https://www.mongodb.com/) (Required for manual local setup)
*   A **Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

---

### Method A: Setup with Docker Compose (Recommended)

Docker Compose spins up all services—including database servers and workers—in a single command.

1.  **Configure Environment**:
    Open the `backend/.env` file and replace the placeholder API key with your actual Gemini API key:
    ```ini
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```

2.  **Run Containers**:
    From the root directory, start all services:
    ```bash
    docker-compose up --build
    ```

3.  **Access App**:
    *   **Frontend UI**: [http://localhost:3000](http://localhost:3000)
    *   **Backend Server**: [http://localhost:5001](http://localhost:5001)
    *   **MongoDB database**: `mongodb://localhost:27017`
    *   **Redis database**: `localhost:6379`

---

### Method B: Manual Local Setup

If you prefer to run services natively on your host machine:

#### Step 1: Start Databases
Ensure MongoDB and Redis services are active locally:
```bash
# Example to run Redis locally
redis-server

# Example to start MongoDB service (varies by OS)
mongod --dbpath=/path/to/your/db
```

#### Step 2: Configure Environment
Confirm `backend/.env` points to your local databases:
```ini
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/vedai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### Step 3: Run the Backend
Navigate to the `backend` folder, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
The backend server runs on `http://localhost:5001`.

#### Step 4: Run the Frontend
In a separate terminal tab, navigate to the `frontend` folder, install dependencies, and run Next.js:
```bash
cd ../frontend
npm install
npm run dev
```
The Next.js client portal runs on `http://localhost:3001` (or fallbacks to `3000`).

---

