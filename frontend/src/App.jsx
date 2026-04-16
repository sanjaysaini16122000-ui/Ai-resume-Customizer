import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !jobDescription) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)

    try {
      const response = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to optimize resume. Please check your backend and API key.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([result.optimized_resume], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Optimized_Resume.txt'
    a.click()
  }

  return (
    <div className="container">
      <header>
        <h1>AI Resume Optimizer</h1>
        <p className="subtitle">Tailor your resume for any job in seconds using AI.</p>
      </header>

      {!result ? (
        <>
          <section className="info-section">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Upload Resume</h3>
              <p>Select your existing resume in PDF or DOCX format. We'll handle the parsing.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Paste Job Title</h3>
              <p>Provide the job description you're targeting. Our AI analyzes the requirements.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Optimized</h3>
              <p>Receive a tailored resume, ATS match score, and keyword analysis instantly.</p>
            </div>
          </section>

          <div className="features-highlight">
            <h2>Why use our AI Optimizer?</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ATS-Friendly Rewriting
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Keyword Gap Analysis
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Instant Match Scoring
              </div>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resume-upload">Upload Resume (PDF/DOCX)</label>
              <input 
                id="resume-upload"
                type="file" 
                accept=".pdf,.docx" 
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="job-desc">Paste Job Description</label>
              <textarea 
                id="job-desc"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loader"></span>
                  Analyzing...
                </>
              ) : 'Customize Resume'}
            </button>
          </form>
        </div>
      </>
    ) : (
        <div className="result-container animate-fade-in">
          <div className="result-grid">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2>Optimized Resume</h2>
                <button className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={handleDownload}>
                  Download TXT
                </button>
              </div>
              <div className="optimized-resume">
                {result.optimized_resume}
              </div>
            </div>

            <aside>
              <div className="score-card">
                <div className="score-circle">{result.ats_score}%</div>
                <p>ATS Match Score</p>
              </div>

              <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h3>Matched Keywords</h3>
                <div className="badge-container">
                  {result.matched_keywords.map(kw => (
                    <span key={kw} className="badge matched">{kw}</span>
                  ))}
                </div>

                <h3 style={{ marginTop: '1.5rem' }}>Missing Keywords</h3>
                <div className="badge-container">
                  {result.missing_keywords.map(kw => (
                    <span key={kw} className="badge missing">{kw}</span>
                  ))}
                </div>
                
                <h3 style={{ marginTop: '1.5rem' }}>Changes Made</h3>
                <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                  {result.changes_summary.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
              
              <button 
                className="btn" 
                style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--glass-border)' }}
                onClick={() => setResult(null)}
              >
                Start Over
              </button>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
