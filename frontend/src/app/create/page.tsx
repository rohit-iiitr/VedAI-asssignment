'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { 
  Upload, 
  Plus, 
  Minus, 
  X, 
  Mic, 
  Calendar, 
  ArrowRight,
  AlertCircle 
} from 'lucide-react';

interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
  compulsoryCount: number;
}

export default function CreateAssignment() {
  const router = useRouter();
  const createAssignment = useAssignmentStore((state) => state.createAssignment);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [schoolName, setSchoolName] = useState('Delhi Public School, Sector-4, Bokaro');
  const [subject, setSubject] = useState('English');
  const [className, setClassName] = useState('5th');
  const [timeAllowed, setTimeAllowed] = useState('45 minutes');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  
  // File Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error validations state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Question Types config states
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 1, compulsoryCount: 4 },
    { type: 'Short Questions', count: 3, marks: 2, compulsoryCount: 3 },
    { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5, compulsoryCount: 5 },
    { type: 'Numerical Problems', count: 5, marks: 5, compulsoryCount: 5 },
  ]);

  const questionOptions = [
    'Multiple Choice Questions',
    'Short Questions',
    'Long Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'True or False Questions',
    'Fill in the Blanks',
  ];

  // Dynamic calculations
  const totalQuestions = questionTypes.reduce((acc, curr) => acc + curr.count, 0);
  const totalMarks = questionTypes.reduce((acc, curr) => acc + (curr.compulsoryCount * curr.marks), 0);

  // Counter Increments / Decrements
  const updateCount = (index: number, delta: number) => {
    const updated = [...questionTypes];
    const newCount = updated[index].count + delta;
    if (newCount >= 0) {
      const prevCount = updated[index].count;
      const prevCompulsory = updated[index].compulsoryCount;
      
      updated[index].count = newCount;
      
      if (prevCompulsory === prevCount) {
        updated[index].compulsoryCount = newCount;
      } else {
        updated[index].compulsoryCount = Math.min(prevCompulsory, newCount);
      }
      
      setQuestionTypes(updated);
    }
  };

  const updateCompulsoryCount = (index: number, delta: number) => {
    const updated = [...questionTypes];
    const currentCompulsory = updated[index].compulsoryCount;
    const newCompulsory = currentCompulsory + delta;
    if (newCompulsory >= 0 && newCompulsory <= updated[index].count) {
      updated[index].compulsoryCount = newCompulsory;
      setQuestionTypes(updated);
    }
  };

  const updateMarks = (index: number, delta: number) => {
    const updated = [...questionTypes];
    const newMarks = updated[index].marks + delta;
    if (newMarks >= 0) {
      updated[index].marks = newMarks;
      setQuestionTypes(updated);
    }
  };

  const deleteRow = (index: number) => {
    setQuestionTypes(questionTypes.filter((_, idx) => idx !== index));
  };

  const addRow = () => {
    setQuestionTypes([
      ...questionTypes,
      { type: 'Short Questions', count: 1, marks: 2, compulsoryCount: 1 }
    ]);
  };

  const handleTypeChange = (index: number, val: string) => {
    const updated = [...questionTypes];
    updated[index].type = val;
    setQuestionTypes(updated);
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.size <= 10 * 1024 * 1024) { // 10MB
        setSelectedFile(file);
      } else {
        alert('File size exceeds the 10MB limit.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    // 1. Validations
    if (!title.trim()) {
      setValidationError('Please enter a valid assignment title.');
      return;
    }
    if (!dueDate) {
      setValidationError('Please select a valid due date.');
      return;
    }
    if (questionTypes.length === 0) {
      setValidationError('Please add at least one question type.');
      return;
    }
    const hasInvalidRows = questionTypes.some(qt => qt.count <= 0 || qt.marks <= 0 || qt.compulsoryCount < 0 || qt.compulsoryCount > qt.count);
    if (hasInvalidRows) {
      setValidationError('All question rows must have count/marks > 0, and compulsory questions cannot exceed total questions.');
      return;
    }

    setValidationError(null);

    // 2. Call Zustand createAssignment
    const result = await createAssignment({
      title,
      dueDate,
      schoolName,
      subject,
      className,
      timeAllowed,
      maxMarks: totalMarks,
      questionTypes,
      additionalInstructions,
      file: selectedFile || undefined
    });

    if (result) {
      // Direct redirect to live generator output screen!
      router.push(`/assignment/${result._id}`);
    }
  };

  return (
    <div className="veda-app-container">
      <Sidebar />

      <main className="veda-main-content">
        <Header title="Assignment" subTitle="Create Assignment" showBack={true} />

        <div className="veda-dashboard-body">
          <div className="create-container-box">
            {/* Step Indicators */}
            <div className="create-step-indicator">
              <div className="step-dot active" />
              <div className="step-dot" />
            </div>

            <h2 className="create-title">Create Assignment</h2>
            <p className="create-desc">Set up a new assignment for your students</p>

            {validationError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontWeight: 500
              }}>
                <AlertCircle size={18} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Title Block */}
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Quiz on Electricity, Solar System Quiz..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* School details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">School / Institute Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Class / Grade</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Time Allowed</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(e.target.value)}
                />
              </div>
            </div>

            {/* File Drag and Drop zone */}
            <div className="form-group">
              <label className="form-label">Assignment Details</label>
              <div 
                className={`upload-dropzone ${selectedFile ? 'selected' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,application/pdf,text/plain"
                />
                <div className="upload-icon-wrap">
                  <Upload size={20} />
                </div>
                <span className="upload-text">
                  {selectedFile ? selectedFile.name : 'Choose a file or drag & drop it here'}
                </span>
                <span className="upload-subtext">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'JPEG, PNG, PDF, TXT upto 10MB'}
                </span>
              </div>
            </div>

            {/* Due date Datepicker */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
                <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Question weights counters list */}
            <div className="form-group">
              <label className="form-label">Question Type</label>
              
              <div className="question-types-table-header">
                <span>TYPE</span>
                <div className="question-type-table-header-counters">
                  <span>NO. OF QUESTIONS</span>
                  <span>COMPULSORY</span>
                  <span>MARKS</span>
                </div>
                <span></span>
              </div>

              {questionTypes.map((qt, index) => (
                <div className="question-type-row" key={index}>
                  <select 
                    className="question-type-select"
                    value={qt.type}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                  >
                    {questionOptions.map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <div className="question-type-counters-group">
                    <div className="counter-column">
                      <span className="counter-column-label">Questions</span>
                      <div className="counter-widget">
                        <button className="btn-counter" onClick={() => updateCount(index, -1)}>
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="counter-value">{qt.count}</span>
                        <button className="btn-counter" onClick={() => updateCount(index, 1)}>
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    <div className="counter-column">
                      <span className="counter-column-label">Compulsory</span>
                      <div className="counter-widget">
                        <button className="btn-counter" onClick={() => updateCompulsoryCount(index, -1)}>
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="counter-value">{qt.compulsoryCount}</span>
                        <button className="btn-counter" onClick={() => updateCompulsoryCount(index, 1)}>
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    <div className="counter-column">
                      <span className="counter-column-label">Marks</span>
                      <div className="counter-widget">
                        <button className="btn-counter" onClick={() => updateMarks(index, -1)}>
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="counter-value">{qt.marks}</span>
                        <button className="btn-counter" onClick={() => updateMarks(index, 1)}>
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="btn-delete-row" onClick={() => deleteRow(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}

              <button className="btn-add-type" onClick={addRow}>
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Question Type</span>
              </button>

              <div className="totals-summary-box">
                <span>Total Questions: <strong>{totalQuestions}</strong></span>
                <span>Total Marks: <strong>{totalMarks}</strong></span>
              </div>
            </div>

            {/* Additional Info instructions */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Additional Information (For better output)</label>
              <textarea 
                className="form-input" 
                rows={3}
                placeholder="e.g. Generate a question paper for 3 hour exam duration covering NCERT Class 8 chapters..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                style={{ resize: 'vertical', paddingRight: '44px' }}
              />
              <Mic size={18} style={{ position: 'absolute', right: '16px', bottom: '16px', color: 'var(--text-muted)', cursor: 'pointer' }} />
            </div>

            {/* Footer buttons */}
            <div className="create-form-footer">
              <button className="btn-footer-prev" onClick={() => router.back()}>
                Previous
              </button>
              <button className="btn-footer-next" onClick={handleSubmit}>
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
