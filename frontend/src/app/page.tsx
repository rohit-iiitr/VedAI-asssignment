'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAssignmentStore, IAssignment } from '@/store/useAssignmentStore';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { 
    assignments, 
    isLoading, 
    error, 
    fetchAssignments, 
    deleteAssignment 
  } = useAssignmentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Toggle action overlay menu for specific card
  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Close menus on page click
  useEffect(() => {
    const closeAll = () => setActiveMenuId(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(id);
    }
  };

  // Filtering assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="veda-app-container">
      {/* Left Sidebar */}
      <Sidebar assignmentsCount={assignments.length} />

      {/* Main Panel */}
      <main className="veda-main-content">
        <Header title="Assignments" />

        <div className="veda-dashboard-body">
          {/* Main Title Bar */}
          {/* <div className="assignments-header-bar">
            <div>
              <h2 className="assignments-header-title">Assignments</h2>
              <span className="text-secondary" style={{ fontSize: '13px' }}>
                Manage and create assignments for your classes.
              </span>
            </div>
          </div> */}

          {error && (
            <div className="alert-error" style={{
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
              <span>{error}</span>
            </div>
          )}

          {/* If Loading and no items, show simple skeleton */}
          {isLoading && assignments.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
              <div className="loading-spinner-ring" />
            </div>
          ) : assignments.length === 0 ? (
            /* --- EMPTY ASSIGNMENTS STATE (FIGMA EXACT MATCH) --- */
            <div className="empty-state-card">
              <div className="empty-illustration">
                {/* Visual SVG illustration of Magnifying glass + document + Red cross mark */}
                <img src="/Illustrations.png" alt="Placeholder Image"></img>
              </div>

              <h3 className="empty-title">No assignments yet</h3>
              <p className="empty-desc">
                Create your first assignment to start collecting and grading student submissions. 
                You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>

              <Link href="/create">
                <button className="btn-primary">
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Create Your First Assignment</span>
                </button>
              </Link>
            </div>
            
          ) : (
            /* --- FILLED STATE (ASSIGNMENTS GRID) --- */
            <>
              {/* Search and Filters Bar */}
              <div className="assignments-header-bar" style={{ marginTop: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <div className="filters-bar">
                  <div className="search-input-wrap">
                    <Search className="search-icon-svg" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search Assignment" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Filter By: All</option>
                    <option value="pending">Pending</option>
                    <option value="generating">Generating</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="assignments-grid">
                {filteredAssignments.map((item) => {
                  const formatDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  };

                  return (
                    <div 
                      key={item._id}
                      className="assignment-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/assignment/${item._id}`)}
                    >
                      <div className="card-header-row">
                        <span className="card-title">{item.title}</span>
                        <button 
                          className="card-menu-btn" 
                          onClick={(e) => toggleMenu(e, item._id)}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === item._id && (
                          <div 
                            className="card-action-overlay"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/assignment/${item._id}`}>
                              <button className="overlay-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Eye size={14} />
                                  <span>View Assignment</span>
                                </div>
                              </button>
                            </Link>
                            <button 
                              className="overlay-item delete"
                              onClick={(e) => handleDelete(e, item._id)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={14} />
                                  <span>Delete Assignment</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="card-meta-row" style={{ justifyContent: 'space-between', width: '100%', marginTop: 'auto' }}>
                        <span className="card-meta-item">
                          <strong>Assigned on</strong> : {formatDate(item.createdAt)}
                        </span>
                        <span className="card-meta-item">
                          <strong>Due</strong> : {formatDate(item.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
