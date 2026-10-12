import mongoose, { Schema, Document } from 'mongoose';
import { IViewHistoryPoint } from '../types';

export interface ISubmissionDocument extends Document {
  campaignId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  postLink: string;
  currentViews: number;
  previousViews: number;
  lastViewUpdatedAt: Date;
  currentPayout: number;
  highestMilestoneIndex: number;
  isSpikeFlagged: boolean;
  spikeReason?: string;
  isBudgetCapped: boolean;
  viewHistory: IViewHistoryPoint[];
  createdAt: Date;
  updatedAt: Date;
}

const ViewHistoryPointSchema = new Schema<IViewHistoryPoint>(
  {
    views: { type: Number, required: true },
    payout: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign reference is required'],
      index: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true
    },
    postLink: {
      type: String,
      required: [true, 'Post link is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am|youtube\.com|youtu\.be)\/.+$/i,
        'Post link must be a valid Instagram or YouTube URL'
      ]
    },
    currentViews: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    previousViews: {
      type: Number,
      default: 0,
      min: [0, 'Previous views cannot be negative']
    },
    lastViewUpdatedAt: {
      type: Date,
      default: Date.now
    },
    currentPayout: {
      type: Number,
      default: 0,
      min: [0, 'Current payout cannot be negative']
    },
    highestMilestoneIndex: {
      type: Number,
      default: -1
    },
    isSpikeFlagged: {
      type: Boolean,
      default: false
    },
    spikeReason: {
      type: String
    },
    isBudgetCapped: {
      type: Boolean,
      default: false
    },
    viewHistory: {
      type: [ViewHistoryPointSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly find creator's submissions under a campaign
SubmissionSchema.index({ campaignId: 1, creatorId: 1 });

export const Submission = mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);
