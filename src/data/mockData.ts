import { KanbanData, TeamMember, WeeklyStats } from "@/types/kanban";

export const teamMembers: TeamMember[] = [
  {
    id: "alex",
    name: "Alex Chen",
    avatar: "AC",
    color: "alex"
  },
  {
    id: "sarah",
    name: "Sarah Williams",
    avatar: "SW",
    color: "sarah"
  },
  {
    id: "mike",
    name: "Mike Johnson",
    avatar: "MJ",
    color: "mike"
  }
];

export const initialKanbanData: KanbanData = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Design new landing page",
      description: "Create wireframes and mockups for the new product landing page",
      assignee: teamMembers[0],
      priority: "high",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tags: ["design", "frontend"]
    },
    "task-2": {
      id: "task-2",
      title: "Implement user authentication",
      description: "Set up login, register, and password reset functionality",
      assignee: teamMembers[1],
      priority: "high",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      tags: ["backend", "security"]
    },
    "task-3": {
      id: "task-3",
      title: "Write API documentation",
      description: "Document all REST endpoints with examples",
      assignee: teamMembers[2],
      priority: "medium",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (overdue)
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["documentation", "api"]
    },
    "task-4": {
      id: "task-4",
      title: "Set up CI/CD pipeline",
      description: "Configure automated testing and deployment",
      assignee: teamMembers[1],
      priority: "medium",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["devops", "automation"]
    },
    "task-5": {
      id: "task-5",
      title: "Mobile app prototype",
      description: "Create initial prototype for mobile application",
      assignee: teamMembers[0],
      priority: "low",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ["mobile", "prototype"]
    },
    "task-6": {
      id: "task-6",
      title: "Performance optimization",
      description: "Optimize database queries and frontend loading times",
      assignee: teamMembers[2],
      priority: "high",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      tags: ["performance", "optimization"]
    }
  },
  columns: {
    "backlog": {
      id: "backlog",
      title: "Backlog",
      taskIds: ["task-3", "task-5"],
      color: "backlog"
    },
    "ongoing": {
      id: "ongoing",
      title: "Ongoing",
      taskIds: ["task-1", "task-2", "task-4"],
      color: "ongoing"
    },
    "finished": {
      id: "finished",
      title: "Finished",
      taskIds: ["task-6"],
      color: "finished"
    }
  },
  columnOrder: ["backlog", "ongoing", "finished"]
};

export const mockWeeklyStats: WeeklyStats = {
  weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  memberStats: {
    "alex": {
      completed: 3,
      inProgress: 2,
      overdue: 0,
      score: 85
    },
    "sarah": {
      completed: 4,
      inProgress: 1,
      overdue: 0,
      score: 92
    },
    "mike": {
      completed: 2,
      inProgress: 1,
      overdue: 1,
      score: 68
    }
  }
};