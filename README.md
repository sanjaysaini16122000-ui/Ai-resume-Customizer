# AI Resume Customizer Bot 🚀

An AI-powered tool that automatically tailors your resume to a specific job description. Built with **FastAPI**, **React (Vite)**, and **Mistral AI**.

## ✨ Features
- **Smart Parsing**: Extract text from PDF and DOCX files automatically.
- **AI Optimization**: Rewrites bullet points to match job requirements using Mistral AI.
- **ATS Match Score**: Get instant feedback on how well your resume matches the job.
- **Keyword Extraction**: Identifies key skills and missing keywords.
- **Premium UI**: Modern, glassmorphic dark-mode design with smooth animations.

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite (Vanilla CSS)
- **AI**: Mistral AI (mistral-large-latest)
- **Libraries**: `pdfplumber`, `python-docx`, `openai` (compatibility mode)

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ai-resume-customizer-bot.git
   cd ai-resume-customizer-bot
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   # Create a virtual environment and install dependencies
   python -m venv venv
   source venv/bin/activate  # On Windows: ..\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   - Create a `.env` file in the `backend` directory.
   - Add your Mistral API Key:
     ```env
     MISTRAL_API_KEY=your_mistral_api_key_here
     ```

4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

1. **Start Backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

## 🔒 License
MIT License
