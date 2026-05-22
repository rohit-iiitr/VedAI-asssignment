import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { generateAssessment } from '../services/ai';
import { notifyAssignmentUpdate } from '../services/websocket';

export const startWorker = () => {
  const connection = getRedisConnection();

  const worker = new Worker(
    'question-generation',
    async (job: Job) => {
      const { assignmentId } = job.data;
      console.log(`Processing generation for assignment ID: ${assignmentId}`);

      // Find assignment in Mongo
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment with ID ${assignmentId} not found`);
      }

      // Update state to 'generating'
      assignment.status = 'generating';
      await assignment.save();
      notifyAssignmentUpdate(assignmentId, {
        status: 'generating',
        assignmentId,
      });

      try {
        // Run AI assessment generation
        const aiOutput = await generateAssessment({
          title: assignment.title,
          schoolName: assignment.schoolName,
          subject: assignment.subject,
          className: assignment.className,
          timeAllowed: assignment.timeAllowed,
          maxMarks: assignment.maxMarks,
          questionTypes: assignment.questionTypes,
          additionalInstructions: assignment.additionalInstructions,
          fileTextContext: assignment.fileUrl ? `Uploaded resource material regarding standard syllabus topics.` : undefined,
        });

        // Save generated structure to Mongo
        assignment.generatedPaper = {
          sections: aiOutput.sections,
        };
        assignment.answerKey = aiOutput.answerKey;
        assignment.status = 'completed';
        await assignment.save();

        // Broadcast completion
        notifyAssignmentUpdate(assignmentId, {
          status: 'completed',
          assignmentId,
          data: assignment,
        });

        console.log(`Successfully completed generating questions for assignment ID: ${assignmentId}`);
      } catch (error: any) {
        console.error(`AI generation failure for assignment ${assignmentId}:`, error);
        assignment.status = 'failed';
        assignment.errorMessage = error?.message || 'Error occurred during AI generation.';
        await assignment.save();

        // Broadcast failure
        notifyAssignmentUpdate(assignmentId, {
          status: 'failed',
          assignmentId,
          error: assignment.errorMessage,
        });

        throw error;
      }
    },
    { connection }
  );

  worker.on('active', (job) => {
    console.log(`BullMQ active job: ${job.id}`);
  });

  worker.on('completed', (job) => {
    console.log(`BullMQ completed job: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`BullMQ job ${job?.id} failed:`, err);
  });

  console.log('BullMQ generation worker booted up successfully.');
  return worker;
};
