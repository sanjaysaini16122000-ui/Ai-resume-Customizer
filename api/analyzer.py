import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MISTRAL_API_KEY")
if not api_key:
    raise ValueError("MISTRAL_API_KEY environment variable is not set. Please add it to your Vercel project settings.")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.mistral.ai/v1"
)

def analyze_resume(resume_text, job_description, tone="Executive"):
    prompt = f"""
    You are a professional resume optimizer and ATS expert.
    
    Target Tone: {tone} (Ensure the rewritten resume and cover letter reflect this style).
    
    Job Description:
    {job_description}
    
    Current Resume:
    {resume_text}
    
    Tasks:
    1. Extract key skills and tools required by the job.
    2. Rewrite relevant bullet points in the resume to better match the job description using the specified {tone} tone.
    3. Identify missing keywords that should be added.
    4. Calculate an ATS match score (0-100).
    5. Provide a summary of changes made.
    6. Generate a highly-tailored Cover Letter in the {tone} tone.
    7. Provide LinkedIn Profile optimization suggestions.
    8. Generate 5-10 tailored Interview Questions with "Best way to answer" tips.
    9. Analyze skill gap and provide data for a radar chart comparing "User Proficiency" vs "Job Requirement" (scale 0-100).
    
    YOU MUST RETURN A VALID JSON OBJECT.
    
    Structure:
    {{
        "ats_score": number,
        "optimized_resume": "string (full text)",
        "cover_letter": "string (full text)",
        "linkedin_suggestions": {{
            "about": "string",
            "experience_highlights": ["point1", "point2"]
        }},
        "interview_questions": [
            {{"question": "string", "tip": "string"}}
        ],
        "skill_gap_data": [
            {{"subject": "Skill Name", "user": number, "required": number}}
        ],
        "matched_keywords": ["skill1", "tool1"],
        "missing_keywords": ["skill2", "tool2"],
        "changes_summary": ["change1", "change2"]
    }}
    """
    
    response = client.chat.completions.create(
        model="mistral-large-latest",
        messages=[{"role": "system", "content": "You are a professional resume optimizer. You MUST respond with a complete JSON object including ALL requested fields: ats_score, optimized_resume, cover_letter, linkedin_suggestions, interview_questions, skill_gap_data, matched_keywords, missing_keywords, and changes_summary. Do not leave any field empty."},
                  {"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    
    result = response.choices[0].message.content
    print("--- AI RESPONSE ---")
    print(result)
    print("-------------------")
    
    return result
