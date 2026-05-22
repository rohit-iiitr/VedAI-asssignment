'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ClipboardList, 
  Library, 
  Sparkles, 
  Plus 
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Highlight Assignments tab if we are on root '/' or within an assignment detail page
  const isAssignmentsActive = pathname === '/' || pathname.startsWith('/assignment');
  const isCreateActive = pathname === '/create';

  const navItems = [
    { name: 'Home', icon: LayoutGrid, href: '#', active: false },
    { name: 'Assignments', icon: ClipboardList, href: '/', active: isAssignmentsActive },
    { name: 'Library', icon: Library, href: '#', active: false },
    { name: 'AI Toolkit', icon: Sparkles, href: '#', active: false },
  ];

  // Do not display the floating FAB on the creation form page itself
  const showFAB = !isCreateActive;

  return (
    <div className="mobile-bottom-nav-container">
      {/* Floating Action Button (FAB) */}
      {showFAB && (
        <Link href="/create">
          <button className="floating-action-fab" aria-label="Create Assignment">
            <Plus size={24} strokeWidth={3} />
          </button>
        </Link>
      )}

      {/* Floating Glassmorphic Capsule Nav */}
      <nav className="mobile-capsule-nav">
        <ul className="capsule-nav-list">
          {navItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <li key={idx} className="capsule-nav-item-wrap">
                <Link href={item.href}>
                  <div className={`capsule-nav-item ${item.active ? 'active' : ''}`}>
                    <IconComponent size={20} strokeWidth={2.2} />
                    <span className="capsule-item-label">{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
