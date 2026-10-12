import { Request } from 'express';

export type UserRole = 'brand' | 'creator';

export interface IMilestone {
  viewThreshold: number;
  payout: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface ICampaign {
  _id: string;
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: IMilestone[];
  brandId: string;
  status: 'active' | 'completed' | 'paused' | 'exhausted';
  createdAt: Date;
  updatedAt: Date;
}

export interface IViewHistoryPoint {
  views: number;
  payout: number;
  timestamp: Date;
}

export interface ISubmission {
  _id: string;
  campaignId: string | ICampaign;
  creatorId: string | IUser;
  postLink: string;
  currentViews: number;
  previousViews: number;
  lastViewUpdatedAt: Date;
  currentPayout: number;
  highestMilestoneIndex: number; // -1 if no milestone crossed
  isSpikeFlagged: boolean;
  spikeReason?: string;
  isBudgetCapped: boolean;
  viewHistory: IViewHistoryPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export interface PayoutCalculationResult {
  previousPayout: number;
  targetPayout: number;
  owedIncrement: number;
  actualPaidIncrement: number;
  newTotalPayout: number;
  highestMilestoneCrossed: IMilestone | null;
  highestMilestoneIndex: number;
  isBudgetCapped: boolean;
  remainingBudgetBefore: number;
  remainingBudgetAfter: number;
}
