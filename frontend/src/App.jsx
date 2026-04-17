import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('resume')
  const [jobUrl, setJobUrl] = useState('')
  const [tone, setTone] = useState('Executive')
  const [selectedTemplate, setSelectedTemplate] = useState('Modern')
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
    if (!file) {
      setError("Please upload your resume file first.")
      return
    }
    if (!jobDescription) {
      setError("Please provide a job description.")
      return
    }

    setLoading(true)
    setError(null)

    console.log("Submitting optimization request...", { filename: file?.name, tone });
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jobDescription)
    formData.append('tone', tone)

    try {
      const response = await fetch('http://localhost:8000/optimize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to optimize resume.');
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
    if (!result) return
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

  const isKeywordInResume = (keyword) => {
    if (!result?.optimized_resume) return false
    return result.optimized_resume.toLowerCase().includes(keyword.toLowerCase())
  }

  const handleDownload = () => {
    const doc = new jsPDF()
    const text = activeTab === 'resume' ? result.optimized_resume : result.cover_letter
    const title = activeTab === 'resume' ? 'Optimized Resume' : 'Cover Letter'
    
    // Template Styles
    if (selectedTemplate === 'Modern') {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(99, 102, 241) // Primary
      doc.setFontSize(22)
      doc.text(title.toUpperCase(), 20, 25)
      
      doc.setDrawColor(99, 102, 241)
      doc.setLineWidth(1)
      doc.line(20, 28, 60, 28)
      
      doc.setTextColor(40, 40, 40)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
    } else if (selectedTemplate === 'Tech') {
      doc.setFont('courier', 'bold')
      doc.setFillColor(30, 41, 59)
      doc.rect(0, 0, 210, 40, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text(title, 20, 25)
      
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(9)
      doc.setFont('courier', 'normal')
    } else { // Academic
      doc.setFont('times', 'italic')
      doc.setFontSize(20)
      doc.text(title, 105, 25, { align: 'center' })
      
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      doc.setLineWidth(0.5)
      doc.line(40, 28, 170, 28)
    }
    
    const splitText = doc.splitTextToSize(text, 170)
    doc.text(splitText, 20, 45)
    
    doc.save(`${title.replace(' ', '_')}_${selectedTemplate}.pdf`)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-left">
            <div className="logo-group" onClick={() => { navigate('/'); setResult(null); }}>
              <h1>AI Resume Optimizer</h1>
              <p className="nav-subtitle">Tailor your resume in seconds using AI</p>
            </div>
          </div>

          <div className="nav-center">
            <div className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
              <Link to="/features" className={location.pathname === '/features' ? 'active' : ''}>Features</Link>
              <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link>
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-badges">
              <span className="premium-badge">PRO</span>
              {result && <div className="nav-score">{result.ats_score}% Match</div>}
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const HomePage = () => (
    <>
      <header className="hero-header">
        <div className="hero-badge">AI Powered</div>
        <h2>Bypass ATS and land more interviews.</h2>
      </header>

      {!result ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Optimization Tone</label>
              <div className="tone-selector">
                {['Executive', 'Creative', 'Startup'].map(t => (
                  <div 
                    key={t} 
                    className={`tone-option ${tone === t ? 'active' : ''}`}
                    onClick={() => setTone(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Upload Resume (PDF/DOCX)</label>
              <label htmlFor="resume-upload" className={`file-drop-zone ${file ? 'has-file' : ''}`}>
                <input 
                  id="resume-upload"
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      console.log("File selected:", f.name);
                      setFile(f);
                      setError(null); // Clear error when file is picked
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <div className="file-info">
                  {file ? (
                    <div className="selected-file-container">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon-wrapper">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="main-text">Click to upload or drag & drop</p>
                      <p className="sub-text">Supported formats: PDF, DOCX</p>
                    </div>
                  )}
                </div>
              </label>
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
      ) : (
        <div className="result-container animate-fade-in">
          <div className="result-grid">
            <div className="card">
              <div className="tabs">
                <div className={`tab ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>Resume</div>
                <div className={`tab ${activeTab === 'cover' ? 'active' : ''}`} onClick={() => setActiveTab('cover')}>Cover Letter</div>
                <div className={`tab ${activeTab === 'linkedin' ? 'active' : ''}`} onClick={() => setActiveTab('linkedin')}>LinkedIn</div>
                <div className={`tab ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>Interview Prep</div>
              </div>

              <div className="template-picker">
                <span>Template:</span>
                {['Modern', 'Tech', 'Academic'].map(t => (
                  <button key={t} className={`template-btn ${selectedTemplate === t ? 'active' : ''}`} onClick={() => setSelectedTemplate(t)}>{t}</button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2>{activeTab === 'resume' ? 'Optimized Resume' : activeTab === 'cover' ? 'Cover Letter' : activeTab === 'linkedin' ? 'LinkedIn Suggestions' : 'Interview Prep Bot'}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['resume', 'cover'].includes(activeTab) && (
                    <button className="btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={handleDownload}>Download PDF</button>
                  )}
                  <button className="copy-btn" onClick={() => handleCopy(
                    activeTab === 'resume' ? result.optimized_resume : 
                    activeTab === 'cover' ? result.cover_letter : 
                    JSON.stringify(result.linkedin_suggestions, null, 2)
                  )}>Copy Text</button>
                </div>
              </div>

              <div className="content-scroll">
                {activeTab === 'resume' && (
                  <textarea className="editable-area" value={result.optimized_resume || ""} onChange={(e) => handleUpdateResult('optimized_resume', e.target.value)} />
                )}
                {activeTab === 'cover' && (
                  <textarea className="editable-area" value={result.cover_letter || ""} onChange={(e) => handleUpdateResult('cover_letter', e.target.value)} />
                )}
                {activeTab === 'linkedin' && (
                  <div className="linkedin-results">
                    {result.linkedin_suggestions ? (
                      <>
                        <div className="linkedin-section">
                          <h4>About Section (Editable)</h4>
                          <textarea className="editable-area" style={{ minHeight: '200px' }} value={result.linkedin_suggestions.about || ""} onChange={(e) => handleUpdateResult('linkedin_suggestions_about', e.target.value)} />
                        </div>
                        <div className="linkedin-section">
                          <h4>Experience Highlights</h4>
                          <ul className="experience-list">
                            {result.linkedin_suggestions.experience_highlights?.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      </>
                    ) : <p style={{ color: 'var(--text-muted)' }}>LinkedIn suggestions are not available.</p>}
                  </div>
                )}
                {activeTab === 'interview' && (
                  <div className="interview-results">
                    {result.interview_questions?.map((q, i) => (
                      <div key={i} className="interview-card">
                        <h5>{q.question}</h5>
                        <p><span>💡 Tip:</span> {q.tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="changes-section-bottom">
                <h3>Changes Made</h3>
                <ul className="changes-list-horizontal">
                  {result.changes_summary.map((change, i) => (
                    <li key={i}>• {change}</li>
                  ))}
                </ul>
              </div>

              <button className="btn" style={{ marginTop: '1.5rem', background: 'var(--success)' }} onClick={handleSaveToHistory}>💾 Save to History</button>
            </div>

            <aside>
              <div className="score-card">
                <div className="score-circle">{result.ats_score}%</div>
                <p>ATS Match Score</p>
              </div>

              <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                <h3>Skill Gap Analysis</h3>
                <div style={{ width: '100%', height: '300px', display: 'block', position: 'relative' }}>
                  <ResponsiveContainer width="99%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.skill_gap_data || []}>
                      <PolarGrid stroke="var(--glass-border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="User" dataKey="user" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                      <Radar name="Required" dataKey="required" stroke="var(--success)" fill="var(--success)" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <h3 style={{ marginTop: '2rem' }}>Keyword Match Dashboard</h3>
                <div className="keyword-dashboard">
                  {(() => {
                    const allKeywords = [...(result.missing_keywords || []), ...(result.matched_keywords || [])];
                    const foundKeywords = allKeywords.filter(kw => isKeywordInResume(kw));
                    const missingKeywords = allKeywords.filter(kw => !isKeywordInResume(kw));
                    const progress = allKeywords.length > 0 ? Math.round((foundKeywords.length / allKeywords.length) * 100) : 0;

                    return (
                      <>
                        <div className="match-progress-container">
                          <div className="progress-label">
                            <span>Match Progress</span>
                            <span>{foundKeywords.length}/{allKeywords.length}</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="progress-percentText">{progress}% Coverage</p>
                        </div>

                        <div className="keyword-categories">
                          {missingKeywords.length > 0 && (
                            <div className="keyword-category">
                              <label>Missing - Add These!</label>
                              <div className="pill-container">
                                {missingKeywords.map(kw => (
                                  <span key={kw} className="pill missing">{kw}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {foundKeywords.length > 0 && (
                            <div className="keyword-category" style={{ marginTop: '1.5rem' }}>
                              <label>Found in Resume</label>
                              <div className="pill-container">
                                {foundKeywords.map(kw => (
                                  <span key={kw} className="pill found">✓ {kw}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <button className="btn" style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setResult(null)}>Start Over</button>
            </aside>
          </div>
        </div>
      )}
    </>
  );

  const FeaturesPage = () => (
    <div className="page-content">
      <header className="hero-header">
        <div className="hero-badge">Key Features</div>
        <h2>Powerful AI tools for your career.</h2>
      </header>
      
      <section className="info-section">
        <div className="step-card">
          <div className="step-number">1</div>
          <h3>AI Optimization</h3>
          <p>Advanced keyword matching and tone adjustment for any industry.</p>
        </div>
        <div className="step-card">
          <div className="step-number">2</div>
          <h3>Real-time Tracking</h3>
          <p>Watch your ATS score improve live as you edit your resume.</p>
        </div>
        <div className="step-card">
          <div className="step-number">3</div>
          <h3>Premium Exports</h3>
          <p>Beautiful, print-ready PDF templates for Modern, Tech, and Academic styles.</p>
        </div>
      </section>

      <div className="features-highlight" style={{ marginTop: '4rem' }}>
        <h2>Complete AI Feature Set</h2>
        <div className="feature-grid">
          <div className="feature-item">✓ Interview Prep Bot</div>
          <div className="feature-item">✓ LinkedIn Optimizer</div>
          <div className="feature-item">✓ Cover Letter Generator</div>
          <div className="feature-item">✓ Skill Gap Radar Charts</div>
        </div>
      </div>
    </div>
  );

  const HistoryPage = () => {
    const navigate = useNavigate();
    return (
      <div className="history-section" style={{ minHeight: '60vh' }}>
        <header className="hero-header">
          <div className="hero-badge">Persistence</div>
          <h2>Your Saved Resumes</h2>
        </header>
        
        {history.length > 0 ? (
          <div className="history-grid">
            {history.map(item => (
              <div key={item.id} className="history-card" onClick={() => {
                setResult(item.result);
                setJobDescription(item.jobDescription);
                navigate('/');
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
        ) : (
          <div className="empty-history">
            <p>No saved resumes found. Start by customizing one on the Home page!</p>
            <button className="btn" style={{ width: 'auto', marginTop: '1rem' }} onClick={() => navigate('/')}>Start Optimizing</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className="container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
