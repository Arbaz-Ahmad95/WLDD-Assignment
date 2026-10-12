export type UserRole = 'brand' | 'creator';

export interface IMilestone {
  viewThreshold: number;
  payout: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ICampaign {
  _id: string;
  name: string;
  platform: 'Instagram' | 'YouTube';
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  milestones: IMilestone[];
  brandId: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  status: 'active' | 'completed' | 'paused' | 'exhausted';
  createdAt: string;
  updatedAt: string;
}

export interface IViewHistoryPoint {
  views: number;
  payout: number;
  timestamp: string;
}

export interface ISubmission {
  _id: string;
  campaignId: ICampaign | string;
  creatorId: IUser | string;
  postLink: string;
  currentViews: number;
  previousViews: number;
  lastViewUpdatedAt: string;
  currentPayout: number;
  highestMilestoneIndex: number;
  isSpikeFlagged: boolean;
  spikeReason?: string;
  isBudgetCapped: boolean;
  viewHistory: IViewHistoryPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandStats {
  totalCampaigns: number;
  totalCommittedBudget: number;
  totalSpentBudget: number;
  totalRemainingBudget: number;
  totalSubmissions: number;
  totalViewsDriven: number;
}

export interface CreatorStats {
  totalEarnings: number;
  totalViews: number;
  totalSubmissions: number;
}
