import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'

function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('resume')
  const [jobUrl, setJobUrl] = useState('')
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('resume_history')
    return saved ? JSON.parse(saved) : []
  })

  // Effects
  useEffect(() => {
    localStorage.setItem('resume_history', JSON.stringify(history))
  }, [history])

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

  const handleScrape = async () => {
    if (!jobUrl) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl })
      })
      if (!response.ok) throw new Error('Failed to fetch job details.')
      const data = await response.json()
      setJobDescription(data.description)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToHistory = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      result,
      jobDescription
    }
    setHistory([entry, ...history])
    alert('Saved to history!')
  }

  const handleDeleteHistory = (id) => {
    setHistory(history.filter(h => h.id !== id))
  }

  const handleUpdateResult = (field, value) => {
    if (field === 'linkedin_suggestions_about') {
      setResult({
        ...result,
        linkedin_suggestions: { ...result.linkedin_suggestions, about: value }
      })
    } else {
      setResult({ ...result, [field]: value })
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
              <label htmlFor="job-url">Paste Job URL (Optional)</label>
              <div className="scrape-controls">
                <input 
                  id="job-url"
                  className="url-input"
                  placeholder="LinkedIn, Indeed, or Job Board URL..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
                <button type="button" className="fetch-btn" onClick={handleScrape} disabled={loading || !jobUrl}>
                  Fetch Info
                </button>
              </div>

              <label htmlFor="job-desc">Job Description</label>
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
                  <textarea 
                    className="editable-area"
                    value={result.optimized_resume || ""}
                    onChange={(e) => handleUpdateResult('optimized_resume', e.target.value)}
                  />
                )}
                {activeTab === 'cover' && (
                  <textarea 
                    className="editable-area"
                    value={result.cover_letter || ""}
                    onChange={(e) => handleUpdateResult('cover_letter', e.target.value)}
                  />
                )}
                {activeTab === 'linkedin' && (
                  <div className="linkedin-results">
                    {result.linkedin_suggestions ? (
                      <>
                        <div className="linkedin-section">
                          <h4>About Section (Editable)</h4>
                          <textarea 
                            className="editable-area"
                            style={{ minHeight: '200px' }}
                            value={result.linkedin_suggestions.about || ""}
                            onChange={(e) => handleUpdateResult('linkedin_suggestions_about', e.target.value)}
                          />
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

              <button 
                className="btn" 
                style={{ marginTop: '2rem', background: 'var(--success)', boxShadow: 'none' }}
                onClick={handleSaveToHistory}
              >
                💾 Save to History
              </button>
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

      {history.length > 0 && (
        <section className="history-section">
          <h2>Your History</h2>
          <div className="history-grid">
            {history.map(item => (
              <div key={item.id} className="history-card" onClick={() => {
                setResult(item.result);
                setJobDescription(item.jobDescription);
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4>{item.jobDescription.split('\n')[0].substring(0, 30)}...</h4>
                  <div className="mini-score">{item.result.ats_score}%</div>
                </div>
                <p className="date">{item.date}</p>
                <div className="history-actions" onClick={e => e.stopPropagation()}>
                  <button className="mini-btn danger" onClick={() => handleDeleteHistory(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
