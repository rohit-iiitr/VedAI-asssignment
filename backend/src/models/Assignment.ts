import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  questionText: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  id: string; // e.g. "A", "B", "C"
  title: string; // e.g. "Section A"
  type: string; // e.g. "Multiple Choice Questions"
  instruction: string; // e.g. "Attempt all questions. Each question carries 1 mark."
  questions: IQuestion[];
}

export interface IAnswer {
  questionNumber: number;
  answerText: string;
}

export interface IAssignment extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const AnswerSchema = new Schema<IAnswer>({
  questionNumber: { type: Number, required: true },
  answerText: { type: String, required: true },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    questionTypes: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
        marks: { type: Number, required: true },
        compulsoryCount: { type: Number },
      },
    ],
    additionalInstructions: { type: String },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String },
    generatedPaper: {
      sections: [SectionSchema],
    },
    answerKey: [AnswerSchema],
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
