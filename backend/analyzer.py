import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("MISTRAL_API_KEY"),
    base_url="https://api.mistral.ai/v1"
)

def analyze_resume(resume_text, job_description):
    prompt = f"""
    You are a professional resume optimizer and ATS expert.
    
    Job Description:
    {job_description}
    
    Current Resume:
    {resume_text}
    
    Tasks:
    1. Extract key skills and tools required by the job.
    2. Rewrite relevant bullet points in the resume to better match the job description while maintaining truthfulness.
    3. Identify missing keywords that should be added.
    4. Calculate an ATS match score (0-100).
    5. Provide a summary of changes made.
    
    YOU MUST RETURN A VALID JSON OBJECT.
    
    Structure:
    {{
        "ats_score": number,
        "optimized_resume": "string (full text)",
        "matched_keywords": ["skill1", "tool1"],
        "missing_keywords": ["skill2", "tool2"],
        "changes_summary": ["change1", "change2"],
        "highlighted_sections": [
            {{"original": "...", "optimized": "..."}}
        ]
    }}
    """
    
    response = client.chat.completions.create(
        model="mistral-large-latest",
        messages=[{"role": "system", "content": "You are a professional resume optimizer. Respond only with JSON."},
                  {"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    
    return response.choices[0].message.content
