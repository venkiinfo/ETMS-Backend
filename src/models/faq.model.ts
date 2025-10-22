import { Schema, model, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FaqModel = model<IFaq>('Faq', faqSchema);