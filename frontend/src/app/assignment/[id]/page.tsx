'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { 
  Download, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function AssignmentDetails() {
  const { id } = useParams() as { id: string };
  const { 
    activeAssignment, 
    isLoading, 
    error, 
    fetchAssignmentById, 
    connectWebSocket, 
    disconnectWebSocket,
    regenerateAssignment
  } = useAssignmentStore();

  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentSection, setStudentSection] = useState('');

  // Fetch Assignment and subscribe to WebSockets on mount
  useEffect(() => {
    if (id) {
      fetchAssignmentById(id);
      connectWebSocket(id);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [id, fetchAssignmentById, connectWebSocket, disconnectWebSocket]);

  // Handle print media fallback classes for clean exports on all devices
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('printing-pdf');
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-pdf');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    document.body.classList.add('printing-pdf');
    // Small delay to ensure browser layout engine repaints before print modal
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-pdf');
    }, 150);
  };

  const handleRegenerate = async () => {
    if (confirm('Are you sure you want to regenerate this question paper? This will overwrite the current questions.')) {
      await regenerateAssignment(id);
    }
  };

  if (isLoading && !activeAssignment) {
    return (
      <div className="veda-app-container">
        <Sidebar />
        <main className="veda-main-content">
          <Header title="Assignment" showBack={true} />
          <div className="websocket-loader-overlay">
            <div className="loading-spinner-ring" />
            <h3 className="loading-heading">Loading Assignment...</h3>
          </div>
        </main>
      </div>
    );
  }

  if (error && !activeAssignment) {
    return (
      <div className="veda-app-container">
        <Sidebar />
        <main className="veda-main-content">
          <Header title="Assignment" showBack={true} />
          <div className="websocket-loader-overlay">
            <AlertCircle size={48} className="text-hard" style={{ color: 'var(--hard-color)' }} />
            <h3 className="loading-heading" style={{ color: 'var(--hard-color)' }}>Error Loading</h3>
            <p className="loading-caption">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // Real-time generator loader state
  const isGenerating = activeAssignment?.status === 'pending' || activeAssignment?.status === 'generating';
  const isFailed = activeAssignment?.status === 'failed';
  const isCompleted = activeAssignment?.status === 'completed';

  return (
    <div className="veda-app-container">
      <Sidebar />

      <main className="veda-main-content">
        <Header 
          title="Assignments" 
          subTitle={activeAssignment ? activeAssignment.title : 'Details'} 
          showBack={true} 
        />

        <div className="veda-dashboard-body">
          {isGenerating && (
            /* --- WEBSOCKET GENERATOR LOADER VIEW --- */
            <div className="websocket-loader-overlay">
              <div className="loading-spinner-ring" />
              <div>
                <h3 className="loading-heading">Generating Question Paper...</h3>
                <p className="loading-caption" style={{ marginTop: '8px' }}>
                  VedaAI is analyzing your instructions, crafting standard curriculum questions, 
                  distributing difficulty tags, and structuring the marking schemes.
                </p>
              </div>
              <span className="card-status-badge generating">
                {activeAssignment?.status === 'pending' ? 'Queued in Redis...' : 'Gemini AI generating...'}
              </span>
            </div>
          )}

          {isFailed && (
            /* --- FAILED STATE VIEW --- */
            <div className="websocket-loader-overlay">
              <AlertCircle size={48} style={{ color: 'var(--hard-color)' }} />
              <div>
                <h3 className="loading-heading" style={{ color: 'var(--hard-color)' }}>AI Generation Failed</h3>
                <p className="loading-caption" style={{ marginTop: '8px' }}>
                  {activeAssignment?.errorMessage || 'An error occurred during prompt compilation.'}
                </p>
              </div>
              <button className="btn-action-accent" onClick={handleRegenerate}>
                <RefreshCw size={16} />
                <span>Retry Generation</span>
              </button>
            </div>
          )}

          {isCompleted && activeAssignment && (
            /* --- COMPLETED PAPER VIEW --- */
            <div className="exam-output-layout">
              
              {/* ChatGPT styled dark instruction header box */}
              <div className="prompt-feedback-bar">
                <div className="prompt-text-content">
                  Certainly, Teacher! Here is your customized Question Paper for <strong>{activeAssignment.schoolName}</strong>. 
                  Generated based on the NCERT syllabus for <strong>{activeAssignment.subject}</strong>, <strong>Class {activeAssignment.className}</strong>.
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn-download-pdf" onClick={handlePrint}>
                    <Download size={16} />
                    <span>Download as PDF</span>
                  </button>
                  <button className="btn-regenerate-top" onClick={handleRegenerate}>
                    <RefreshCw size={16} />
                    <span>Regenerate Paper</span>
                  </button>
                </div>
              </div>

              {/* The Exam Paper Sheet Container */}
              <div className="exam-paper-sheet">
                <h1 className="paper-school-title">{activeAssignment.schoolName}</h1>
                <div className="paper-subject-class">
                  Subject: {activeAssignment.subject} | Class: {activeAssignment.className}
                </div>

                <div className="paper-meta-row">
                  <span>Time Allowed: {activeAssignment.timeAllowed}</span>
                  <span>Maximum Marks: {activeAssignment.maxMarks}</span>
                </div>

                <p className="paper-compulsory-notice">
                  All questions are compulsory unless stated otherwise.
                </p>

                {/* Printable interactive student inputs */}
                <div className="student-info-form-grid">
                  <div className="student-info-field">
                    <span>Name:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>
                  <div className="student-info-field">
                    <span>Roll Number:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. 24"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                    />
                  </div>
                  <div className="student-info-field">
                    <span>Section:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. A"
                      value={studentSection}
                      onChange={(e) => setStudentSection(e.target.value)}
                    />
                  </div>
                </div>

                {/* Render Sections */}
                {activeAssignment.generatedPaper?.sections.map((section, sIdx) => (
                  <div className="paper-section-block" key={section.id}>
                    <h3 className="paper-section-header">Section {section.id}</h3>
                    <div className="paper-section-subheader">{section.type}</div>
                    <p className="paper-section-instruction">{section.instruction}</p>

                    <ul className="paper-questions-list">
                      {section.questions.map((q, qIdx) => {
                        const cleanText = q.questionText.replace(/^(\[?Q(?:uestion)?\s*\d+\]?[\s.:-]*)/i, '');
                        return (
                          <li className="paper-question-item" key={qIdx}>
                            <div className="question-left-wrap">
                              <span className="question-number">{qIdx + 1}.</span>
                              <span className="question-text-body">{cleanText}</span>
                            </div>
                            <div className="question-right-meta">
                              {q.difficulty && (
                                <span className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                                  {q.difficulty}
                                </span>
                              )}
                              <span className="question-marks-badge">
                                [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                <div className="end-of-paper-notice">
                  *** End of Question Paper ***
                </div>
              </div>

              {/* Collapsible Answer Key */}
              {activeAssignment.answerKey && activeAssignment.answerKey.length > 0 && (
                <div className="answer-key-box">
                  <div 
                    className="answer-key-header" 
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                  >
                    <span className="answer-key-title">Answer Key Solutions</span>
                    {showAnswerKey ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {showAnswerKey && (
                    <div className="answer-key-content">
                      {activeAssignment.answerKey.map((ans, idx) => (
                        <div className="answer-item" key={idx}>
                          <span className="answer-number">{ans.questionNumber}.</span>
                          <p className="answer-text">{ans.answerText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}



            </div>
          )}
        </div>
      </main>
    </div>
  );
}
