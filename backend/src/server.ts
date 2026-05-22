import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

import { connectDB } from './config/db';
import { Assignment } from './models/Assignment';
import { assessmentQueue } from './queue/generationQueue';
import { startWorker } from './workers/generationWorker';
import { registerWSClient } from './services/websocket';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory multer storage for optional file uploads
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB cap

// --- API ENDPOINTS ---

// 1. Create assignment & Queue job
app.post('/api/assignments', upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      dueDate,
      schoolName,
      subject,
      className,
      timeAllowed,
      maxMarks,
      questionTypes,
      additionalInstructions,
    } = req.body;

    if (!title || !dueDate || !questionTypes) {
      return res.status(400).json({ error: 'Title, due date and question types are required.' });
    }

    const parsedQuestionTypes = typeof questionTypes === 'string'
      ? JSON.parse(questionTypes)
      : questionTypes;

    if (!Array.isArray(parsedQuestionTypes) || parsedQuestionTypes.length === 0) {
      return res.status(400).json({ error: 'At least one valid question type must be specified.' });
    }

    // Validate no empty/negative values
    for (const qt of parsedQuestionTypes) {
      if (!qt.type || qt.count <= 0 || qt.marks <= 0) {
        return res.status(400).json({ error: 'Question count and marks must be greater than zero.' });
      }
      if (qt.compulsoryCount !== undefined && (qt.compulsoryCount < 0 || qt.compulsoryCount > qt.count)) {
        return res.status(400).json({ error: 'Compulsory questions count must be non-negative and cannot exceed total questions.' });
      }
    }

    const newAssignment = new Assignment({
      title,
      dueDate,
      schoolName: schoolName || 'Delhi Public School, Bokaro',
      subject: subject || 'Science',
      className: className || 'Grade 8',
      timeAllowed: timeAllowed || '45 minutes',
      maxMarks: Number(maxMarks) || 20,
      questionTypes: parsedQuestionTypes,
      additionalInstructions,
      status: 'pending',
      fileUrl: req.file ? `Resource uploaded: ${req.file.originalname}` : undefined,
    });

    await newAssignment.save();

    // Push job to BullMQ queue for async processing
    await assessmentQueue.add('generate', {
      assignmentId: newAssignment._id.toString(),
    });

    res.status(201).json(newAssignment);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error?.message || 'Server error during creation.' });
  }
});

// 2. Fetch all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const list = await Assignment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments list.' });
  }
});

// 3. Fetch single assignment
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const entry = await Assignment.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assignment details.' });
  }
});

// 4. Delete assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json({ message: 'Assignment successfully deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

// 5. Trigger Regeneration
app.post('/api/assignments/:id/regenerate', async (req, res) => {
  try {
    const entry = await Assignment.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    entry.status = 'pending';
    entry.errorMessage = undefined;
    entry.generatedPaper = undefined;
    entry.answerKey = undefined;
    await entry.save();

    // Re-push job to background BullMQ queue
    await assessmentQueue.add('generate', {
      assignmentId: entry._id.toString(),
    });

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to trigger regeneration.' });
  }
});

// --- HTTP SERVER & WEBSOCKET SETUP ---

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Attach WS upgrades to standard web port path '/ws'
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url || '').pathname;
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket, request) => {
  const parameters = url.parse(request.url || '', true).query;
  const assignmentId = parameters.assignmentId as string;

  if (!assignmentId) {
    ws.close(4000, 'assignmentId is required query parameter');
    return;
  }

  registerWSClient(assignmentId, ws);
});

const PORT = process.env.PORT || 5001;

const boot = async () => {
  // 1. Database connection
  await connectDB();

  // 2. Start BullMQ background worker listener
  startWorker();

  // 3. Listen on HTTP port
  server.listen(PORT, () => {
    console.log(`VedaAI Express Server & WS active on port ${PORT}`);
  });
};

boot();
