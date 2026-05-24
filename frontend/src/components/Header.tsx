'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, Menu } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

interface HeaderProps {
  title?: string;
  subTitle?: string;
  showBack?: boolean;
}

export default function Header({ 
  title = 'Assignments', 
  subTitle, 
  showBack = false 
}: HeaderProps) {
  const router = useRouter();
  const toggleSidebar = useAssignmentStore((state) => state.toggleSidebar);

  return (
    <header className="veda-header">
      {/* Desktop Header Content (hidden on mobile via CSS) */}
      <div className="desktop-header-content">
        <div className="header-left">
          {/* Mobile menu trigger */}
          <button className="btn-menu-mobile" onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu size={18} />
          </button>

          {showBack && (
            <button className="btn-back" onClick={() => router.back()}>
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="breadcrumbs">
            <span>{title}</span>
            {subTitle && (
              <>
                <span className="text-muted">/</span>
                <span className="current">{subTitle}</span>
              </>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Notification Bell */}
          <div className="notification-bell">
            <Bell size={18} />
            <span className="notification-badge" />
          </div>

          {/* User profile */}
          <div className="user-profile-menu">
            <div className="user-avatar">JD</div>
            <span className="user-name">John Doe</span>
            <ChevronDown size={14} className="text-muted" />
          </div>
        </div>
      </div>

      {/* Mobile Floating Card Header Content (hidden on desktop via CSS) */}
      <div className="mobile-header-card">
        <div className="mobile-header-left">
          {showBack ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn-back-mobile" onClick={() => router.back()} aria-label="Go back">
                <ArrowLeft size={18} />
              </button>
              <span className="mobile-header-title">{subTitle || title}</span>
            </div>
          ) : (
            <div className="logo-area">
                <img
                  src="Frame 1618872393.png"
                  alt="VedaAI Logo"
                  width={180}
                  height={50}
                
                />
              </div>
          )}
        </div>

        <div className="mobile-header-right">
          <div className="notification-bell-mobile">
            <Bell size={20} />
            <span className="notification-badge-red" />
          </div>
          <div className="user-avatar-mobile">
            <img src="/teacher_avatar.png" alt="Teacher Profile" />
          </div>
          <button className="btn-menu-mobile-trigger" onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
