export type Role = 'STUDENT' | 'RED_TEAM' | 'BLUE_TEAM' | 'ADMIN';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SimulationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar?: string;
  bio?: string;
  securityScore: number;
  twoFactorEnabled: boolean;
  isActive?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Simulation {
  id: string;
  title: string;
  type: string;
  description: string;
  status: SimulationStatus;
  score: number;
  findings?: SimulationFinding[];
  createdAt: string;
  completedAt?: string;
}

export interface SimulationFinding {
  step: number;
  action: string;
  severity: Severity;
  payload: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  source: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  content: string;
  hints?: string[];
  progress?: {
    isCompleted: boolean;
    attempts: number;
    score: number;
  } | null;
}

export interface Vulnerability {
  id: string;
  name: string;
  cveId?: string;
  severity: Severity;
  description: string;
  solution: string;
  category: string;
  cvssScore: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor?: boolean;
}

export interface DashboardStats {
  simCount: number;
  alertCount: number;
  challengeCount: number;
  recentSims: Simulation[];
  topUsers: User[];
  simsByType: { type: string; _count: number }[];
  alertsBySeverity: { severity: Severity; _count: number }[];
}

export interface ScanFinding {
  id: string;
  scanId: string;
  severity: Severity;
  ruleId: string;
  message: string;
  line?: number;
  column?: number;
  code?: string;
  fix?: string;
  category?: string;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  score: number;
  engine: string;
}

export interface CodeScan {
  id: string;
  language: string;
  filename: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  score: number;
  summary?: ScanSummary;
  findings?: ScanFinding[];
  createdAt: string;
  completedAt?: string;
  _count?: { findings: number };
}
