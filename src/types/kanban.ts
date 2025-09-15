export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: TeamMember;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  color: 'alex' | 'sarah' | 'mike';
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color: 'backlog' | 'ongoing' | 'finished';
}

export interface KanbanData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

export interface WeeklyStats {
  weekStart: Date;
  memberStats: Record<string, {
    completed: number;
    inProgress: number;
    overdue: number;
    score: number;
  }>;
}