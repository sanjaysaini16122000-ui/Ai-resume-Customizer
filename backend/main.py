from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from parser import extract_text
from analyzer import analyze_resume

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Resume Customizer API is running"}

@app.post("/optimize")
async def optimize_resume_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text
        resume_text = extract_text(file_content, file.filename)
        
        # Analyze with AI
        result_json = analyze_resume(resume_text, job_description)
        
        return json.loads(result_json)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
