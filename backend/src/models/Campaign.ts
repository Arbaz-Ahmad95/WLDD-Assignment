import mongoose, { Schema, Document } from 'mongoose';
import { IMilestone } from '../types';

export interface ICampaignDocument extends Document {
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: IMilestone[];
  brandId: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'paused' | 'exhausted';
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    viewThreshold: {
      type: Number,
      required: [true, 'viewThreshold is required'],
      min: [1, 'viewThreshold must be greater than 0']
    },
    payout: {
      type: Number,
      required: [true, 'payout is required'],
      min: [0, 'payout cannot be negative']
    }
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaignDocument>(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      minlength: [3, 'Campaign name must be at least 3 characters']
    },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube'],
      required: [true, 'Platform must be Instagram or YouTube']
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [100, 'Total budget must be at least ₹100']
    },
    spentBudget: {
      type: Number,
      default: 0,
      min: [0, 'Spent budget cannot be negative']
    },
    remainingBudget: {
      type: Number,
      default: function (this: ICampaignDocument) {
        return this.totalBudget;
      }
    },
    milestones: {
      type: [MilestoneSchema],
      required: [true, 'Milestone ladder is required'],
      validate: {
        validator: function (milestones: IMilestone[]) {
          return milestones && milestones.length > 0;
        },
        message: 'At least one milestone is required in the ladder'
      }
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Brand reference is required']
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'exhausted'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: auto-sort milestones by viewThreshold ascending and sync remainingBudget
CampaignSchema.pre<ICampaignDocument>('save', function (next) {
  if (this.milestones && this.milestones.length > 0) {
    this.milestones.sort((a, b) => a.viewThreshold - b.viewThreshold);
  }
  this.remainingBudget = Math.max(0, this.totalBudget - this.spentBudget);
  if (this.remainingBudget <= 0 && this.status === 'active') {
    this.status = 'exhausted';
  }
  next();
});

export const Campaign = mongoose.model<ICampaignDocument>('Campaign', CampaignSchema);
