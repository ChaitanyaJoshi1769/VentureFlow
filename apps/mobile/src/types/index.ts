export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: 'admin' | 'manager' | 'user';
}

export interface Investor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  firm: string;
  sectors: string[];
  stages: string[];
}

export interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  currentStage: string;
  targetAmount: number;
  raised: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  resourceId: string;
  createdAt: Date;
  userId: string;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
}
