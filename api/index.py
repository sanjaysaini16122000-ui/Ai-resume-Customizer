from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import json
import requests
from bs4 import BeautifulSoup
from resume_parser import extract_text
from analyzer import analyze_resume

app = FastAPI(root_path="/api")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scrape")
async def scrape_job(payload: dict = Body(...)):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Heuristic for Job Boards: Look for specific containers
        # removing script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # get text
        text = soup.get_text(separator=' ')

        # break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return {"description": text[:5000]} # Limit text length
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AI Resume Customizer API is running"}

@app.post("/optimize")
async def optimize_resume_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    tone: str = Form("Executive")
):
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text
        resume_text = extract_text(file_content, file.filename)
        
        # Analyze with AI
        result_json = analyze_resume(resume_text, job_description, tone)
        
        return json.loads(result_json)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
