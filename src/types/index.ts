export interface Child {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  level: number;
  totalXp: number;
  parentId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
  difficulty: 'easy' | 'medium' | 'hard';
  coins: number;
  xp: number;
  assignedTo: string; // child ID
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  completedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  lastResetAt?: Date;
  icon: string;
  createdBy: string; // parent ID
  category?: string; // Categoria per raggruppamento
  isConfigured: boolean; // Controllato dal genitore (switch)
  isCompleted: boolean; // Controllato dal bambino (completamento)
  timeSlot?: string; // Fascia oraria (es. "Mattina", "Pomeriggio")
  lastCompletedDate?: Date; // Data dell'ultimo completamento
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: string;
  createdBy: string; // parent ID
  redeemedBy?: string; // child ID
  redeemedAt?: Date;
}

export interface Parent {
  id: string;
  name: string;
  avatar: string;
  role: 'parent';
}

export interface Family {
  id: string;
  name: string;
  createdAt: Date;
  parents: Parent[];
  children: Child[];
}

export interface AppState {
  family: Family;
  tasks: Task[];
  rewards: Reward[];
  currentMode: 'parent' | 'child';
  currentChildId: string;
  setupComplete: boolean;
  parentPin: string;
}

export type ViewMode = 'setup' | 'parent-dashboard' | 'child-dashboard' | 'task-management' | 'reward-management' | 'approval-queue' | 'manage-chores';
