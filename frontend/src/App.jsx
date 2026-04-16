import { useState } from 'react'
import { jsPDF } from 'jspdf'

function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('resume')

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
    const doc = new jsPDF()
    const text = activeTab === 'resume' ? result.optimized_resume : result.cover_letter
    const title = activeTab === 'resume' ? 'Optimized Resume' : 'Cover Letter'
    
    // Simple PDF formatting
    doc.setFontSize(16)
    doc.text(title, 20, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const splitText = doc.splitTextToSize(text, 170)
    doc.text(splitText, 20, 30)
    
    doc.save(`${title.replace(' ', '_')}.pdf`)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
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
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'resume' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('resume')}
                >
                  Resume
                </div>
                <div 
                  className={`tab ${activeTab === 'cover' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('cover')}
                >
                  Cover Letter
                </div>
                <div 
                  className={`tab ${activeTab === 'linkedin' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('linkedin')}
                >
                  LinkedIn
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2>{activeTab === 'resume' ? 'Optimized Resume' : activeTab === 'cover' ? 'Cover Letter' : 'LinkedIn Suggestions'}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {activeTab !== 'linkedin' && (
                    <button className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={handleDownload}>
                      Download PDF
                    </button>
                  )}
                  <button className="copy-btn" onClick={() => handleCopy(
                    activeTab === 'resume' ? result.optimized_resume : 
                    activeTab === 'cover' ? result.cover_letter : 
                    JSON.stringify(result.linkedin_suggestions, null, 2)
                  )}>
                    Copy Text
                  </button>
                </div>
              </div>

              <div className="content-scroll">
                {activeTab === 'resume' && (
                  <div className="optimized-resume">
                    {result.optimized_resume || "No optimized resume generated."}
                  </div>
                )}
                {activeTab === 'cover' && (
                  <div className="optimized-resume">
                    {result.cover_letter || "The AI could not generate a cover letter for this job description. Try providing more details."}
                  </div>
                )}
                {activeTab === 'linkedin' && (
                  <div className="linkedin-results">
                    {result.linkedin_suggestions ? (
                      <>
                        <div className="linkedin-section">
                          <h4>About Section</h4>
                          <div className="optimized-resume" style={{ fontSize: '0.9rem' }}>
                            {result.linkedin_suggestions.about || "No suggestions for About section."}
                          </div>
                        </div>
                        <div className="linkedin-section">
                          <h4>Experience Highlights</h4>
                          <ul className="experience-list">
                            {result.linkedin_suggestions.experience_highlights?.length > 0 ? (
                              result.linkedin_suggestions.experience_highlights.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))
                            ) : (
                              <li style={{ color: 'var(--text-muted)' }}>No experience highlights generated.</li>
                            )}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>LinkedIn suggestions are not available for this analysis.</p>
                    )}
                  </div>
                )}
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
