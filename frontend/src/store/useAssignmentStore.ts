import { create } from 'zustand';

export interface IQuestion {
  questionText: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string;
  title: string;
  type: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswer {
  questionNumber: number;
  answerText: string;
}

export interface IAssignment {
  _id: string;
  title: string;
  dueDate: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  questionTypes: {
    type: string;
    count: number;
    marks: number;
    compulsoryCount?: number;
  }[];
  additionalInstructions?: string;
  fileUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  generatedPaper?: {
    sections: ISection[];
  };
  answerKey?: IAnswer[];
  createdAt: string;
  updatedAt: string;
}

interface AssignmentState {
  assignments: IAssignment[];
  activeAssignment: IAssignment | null;
  isLoading: boolean;
  error: string | null;
  wsConnectionState: 'connecting' | 'connected' | 'disconnected';
  activeWs: WebSocket | null;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<IAssignment | null>;
  createAssignment: (data: {
    title: string;
    dueDate: string;
    schoolName: string;
    subject: string;
    className: string;
    timeAllowed: string;
    maxMarks: number;
    questionTypes: { type: string; count: number; marks: number; compulsoryCount?: number }[];
    additionalInstructions?: string;
    file?: File;
  }) => Promise<IAssignment | null>;
  deleteAssignment: (id: string) => Promise<boolean>;
  regenerateAssignment: (id: string) => Promise<void>;
  connectWebSocket: (assignmentId: string) => void;
  disconnectWebSocket: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001/ws';

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  assignments: [],
  activeAssignment: null,
  isLoading: false,
  error: null,
  wsConnectionState: 'disconnected',
  activeWs: null,
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments.');
      const data = await res.json();
      set({ assignments: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load assignments.', isLoading: false });
    }
  },

  fetchAssignmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`);
      if (!res.ok) throw new Error('Failed to retrieve assignment details.');
      const data = await res.json();
      set({ activeAssignment: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to retrieve assignment.', isLoading: false });
      return null;
    }
  },

  createAssignment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('dueDate', data.dueDate);
      formData.append('schoolName', data.schoolName);
      formData.append('subject', data.subject);
      formData.append('className', data.className);
      formData.append('timeAllowed', data.timeAllowed);
      formData.append('maxMarks', data.maxMarks.toString());
      formData.append('questionTypes', JSON.stringify(data.questionTypes));
      if (data.additionalInstructions) {
        formData.append('additionalInstructions', data.additionalInstructions);
      }
      if (data.file) {
        formData.append('file', data.file);
      }

      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to trigger assignment generation.');
      }

      const newAssignment = await res.json();
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        isLoading: false,
      }));
      return newAssignment;
    } catch (err: any) {
      set({ error: err.message || 'Creation failed.', isLoading: false });
      return null;
    }
  },

  deleteAssignment: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Deletion failed.');
      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== id),
        activeAssignment: state.activeAssignment?._id === id ? null : state.activeAssignment,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete assignment.' });
      return false;
    }
  },

  regenerateAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}/regenerate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Regeneration request failed.');
      const updated = await res.json();
      set({ activeAssignment: updated, isLoading: false });
      
      // Force reconnect websocket to watch updates
      get().connectWebSocket(id);
    } catch (err: any) {
      set({ error: err.message || 'Failed to trigger regeneration.', isLoading: false });
    }
  },

  connectWebSocket: (assignmentId) => {
    // Clean up any existing connection
    get().disconnectWebSocket();

    set({ wsConnectionState: 'connecting' });
    console.log(`Establishing WebSocket to assignment: ${assignmentId}`);
    
    try {
      const ws = new WebSocket(`${WS_BASE}?assignmentId=${assignmentId}`);

      ws.onopen = () => {
        console.log('WebSocket successfully connected');
        set({ wsConnectionState: 'connected', activeWs: ws });
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        console.log('WebSocket update message received:', payload);
        
        // Sync active assignment document
        if (payload.assignmentId === assignmentId) {
          if (payload.status === 'completed' && payload.data) {
            set({ activeAssignment: payload.data });
          } else {
            set((state) => {
              if (!state.activeAssignment) return state;
              return {
                activeAssignment: {
                  ...state.activeAssignment,
                  status: payload.status,
                  errorMessage: payload.error || undefined,
                },
              };
            });
          }
          
          // Refresh general list in the background
          get().fetchAssignments();
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.reason);
        set({ wsConnectionState: 'disconnected', activeWs: null });
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        set({ wsConnectionState: 'disconnected', activeWs: null });
      };
    } catch (err) {
      console.error('Failed to create WebSocket client:', err);
      set({ wsConnectionState: 'disconnected', activeWs: null });
    }
  },

  disconnectWebSocket: () => {
    const { activeWs } = get();
    if (activeWs) {
      activeWs.close();
      set({ activeWs: null, wsConnectionState: 'disconnected' });
      console.log('WebSocket connection closed manually.');
    }
  },
}));
