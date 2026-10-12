const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('memed_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  signup: (payload: any) => request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request<any>('/auth/me', { method: 'GET' }),
  seedDemo: () => request<any>('/auth/seed', { method: 'POST' }),

  // Campaigns
  getLiveCampaigns: (platform?: string) => {
    const query = platform ? `?platform=${platform}` : '';
    return request<any>(`/campaigns${query}`, { method: 'GET' });
  },
  getBrandCampaigns: () => request<any>('/campaigns/brand', { method: 'GET' }),
  getCampaignById: (id: string) => request<any>(`/campaigns/${id}`, { method: 'GET' }),
  createCampaign: (payload: any) => request<any>('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),

  // Submissions
  submitPost: (payload: any) => request<any>('/submissions', { method: 'POST', body: JSON.stringify(payload) }),
  getCreatorEarnings: () => request<any>('/submissions/creator', { method: 'GET' }),
  getSubmissionById: (id: string) => request<any>(`/submissions/${id}`, { method: 'GET' }),
  
  // Platform View Simulator
  // PATCH /api/submissions/:id/views - no role check needed
  updateViews: (id: string, views: number) =>
    request<any>(`/submissions/${id}/views`, {
      method: 'PATCH',
      body: JSON.stringify({ views })
    })
};
