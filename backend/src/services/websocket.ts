import { WebSocket } from 'ws';

// Map of assignmentId -> active WebSocket client sockets
const clientConnections = new Map<string, WebSocket[]>();

export const registerWSClient = (assignmentId: string, ws: WebSocket) => {
  if (!clientConnections.has(assignmentId)) {
    clientConnections.set(assignmentId, []);
  }
  clientConnections.get(assignmentId)!.push(ws);
  console.log(`WebSocket client registered for assignment: ${assignmentId}`);

  ws.on('close', () => {
    console.log(`WebSocket client disconnected from assignment: ${assignmentId}`);
    const clients = clientConnections.get(assignmentId) || [];
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    if (clients.length === 0) {
      clientConnections.delete(assignmentId);
    }
  });
};

export const notifyAssignmentUpdate = (assignmentId: string, payload: {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  assignmentId: string;
  data?: any;
  error?: string;
}) => {
  const clients = clientConnections.get(assignmentId) || [];
  console.log(`Broadcasting update for assignment ${assignmentId} to ${clients.length} clients`);
  const messageStr = JSON.stringify(payload);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
};
