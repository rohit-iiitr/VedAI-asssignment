"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import {
  Plus,
  Home,
  Users,
  FileText,
  Wand2,
  Library,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  assignmentsCount?: number;
}

export default function Sidebar({ assignmentsCount }: SidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, assignments, fetchAssignments } =
    useAssignmentStore();

  React.useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const activeCount =
    assignmentsCount !== undefined ? assignmentsCount : assignments.length;

  const menuItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "My Groups", icon: Users, href: "#" },
    { name: "Assignments", icon: FileText, href: "/", badge: activeCount },
    { name: "AI Teacher's Toolkit", icon: Wand2, href: "#" },
    { name: "My Library", icon: Library, href: "#", badge: 32 },
  ];

  return (
    <>
      {/* Click outside backdrop for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-mobile-backdrop" onClick={closeSidebar} />
      )}

      <aside className={`veda-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          {/* Logo & Mobile Close button row */}
          <div className="logo-row-mobile">
            <Link href="/" onClick={closeSidebar}>
              <div className="logo-area">
                <img
                  src="Frame 1618872393.png"
                  alt="VedaAI Logo"
                  width={200}
                  height={50}
                
                />
              </div>
            </Link>
            <button
              className="btn-close-sidebar-mobile"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* The glowing active orange-outlined Create Button */}
          <Link href="/create" onClick={closeSidebar}>
            <button className="btn-create-assignment-trigger">
              <Plus size={16} strokeWidth={3} />
              <span>Create Assignment</span>
            </button>
          </Link>

          {/* Menu Navigation */}
          <nav>
            <ul className="veda-menu">
              {menuItems.map((item, idx) => {
                const IconComponent = item.icon;
                const isActive =
                  item.name === "Assignments"
                    ? pathname === "/" || pathname.startsWith("/assignment")
                    : pathname === item.href;

                return (
                  <li key={idx}>
                    <Link href={item.href} onClick={closeSidebar}>
                      <div className={`menu-item ${isActive ? "active" : ""}`}>
                        <div className="menu-item-left">
                          <IconComponent size={18} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="menu-badge">{item.badge}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Footer Profile */}
        <div className="sidebar-footer">
          <div className="menu-item" onClick={closeSidebar}>
            <div className="menu-item-left">
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </div>

          <div className="profile-school-card">
            <div className="school-avatar">
              <svg
                width="40"
                height="40"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Delhi Public School crest"
              >
                {/* Outer double-circle border */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#1B5E20"
                  strokeWidth="2.5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#1B5E20"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Outer crest shield shape */}
                <path
                  d="M60 22C42 22 36 34 36 50C36 78 60 98 60 98C60 98 84 78 84 50C84 34 78 22 60 22Z"
                  stroke="#1B5E20"
                  strokeWidth="3"
                  fill="#E8F5E9"
                  fillOpacity="0.3"
                />

                {/* Inner Shield outline */}
                <path
                  d="M60 28C47 28 42 37 42 50C42 70 60 88 60 88C60 88 78 70 78 50C78 37 73 28 60 28Z"
                  stroke="#1B5E20"
                  strokeWidth="1.5"
                />

                {/* The Torch/Flame in center */}
                {/* Torch handle */}
                <path d="M57 68 L63 68 L61 52 L59 52 Z" fill="#1B5E20" />
                <rect
                  x="56"
                  y="68"
                  width="8"
                  height="4"
                  fill="#1B5E20"
                  rx="1"
                />
                {/* Torch flame */}
                <path
                  d="M60 38 C54 44 55 52 60 52 C65 52 66 44 60 38 Z"
                  fill="#1B5E20"
                />
                <path
                  d="M60 42 C57 45 57 49 60 49 C63 49 63 45 60 42 Z"
                  fill="#E8F5E9"
                />

                {/* Banner ribbon at the bottom */}
                <path
                  d="M25 82 C40 92 80 92 95 82"
                  stroke="#1B5E20"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M28 85 C42 95 78 95 92 85"
                  stroke="#1B5E20"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>
            <div className="school-info">
              <span className="school-name">Delhi Public School</span>
              <span className="school-loc">Bokaro Steel City</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
