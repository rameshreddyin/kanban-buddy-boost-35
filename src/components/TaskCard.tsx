import { Task, TeamMember } from "@/types/kanban";
import { Calendar, Clock, Flag, Play, Square, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTaskDialog } from "./EditTaskDialog";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  showMemberHighlight?: boolean;
  teamMembers?: TeamMember[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCard({ 
  task, 
  isDragging, 
  showMemberHighlight, 
  teamMembers, 
  onUpdateTask, 
  onDeleteTask 
}: TaskCardProps) {
  const isOverdue = task.dueDate && new Date() > task.dueDate;
  const isStuck = new Date() > new Date(task.updatedAt.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  
  // Calculate days since last update
  const daysSinceUpdate = Math.floor((new Date().getTime() - task.updatedAt.getTime()) / (24 * 60 * 60 * 1000));
  const daysSinceCreation = Math.floor((new Date().getTime() - task.createdAt.getTime()) / (24 * 60 * 60 * 1000));

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <Flag className="w-3 h-3 text-status-overdue" />;
      case 'medium':
        return <Flag className="w-3 h-3 text-status-ongoing" />;
      case 'low':
        return <Flag className="w-3 h-3 text-status-backlog" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`
        group bg-gradient-card border border-border rounded-lg p-4
        shadow-card hover:shadow-lg transition-all duration-200
        ${isDragging ? 'rotate-2 shadow-glow' : 'hover:-translate-y-1'}
        ${isOverdue ? 'border-status-overdue/50' : ''}
        ${isStuck ? 'border-status-ongoing/50' : ''}
        ${showMemberHighlight ? `border-l-4 border-l-team-${task.assignee.color}` : ''}
      `}
    >
      {/* Header with priority, assignee and actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getPriorityIcon()}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showMemberHighlight && (
            <span className="text-xs text-muted-foreground font-medium">
              {task.assignee.name}
            </span>
          )}
          <div 
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
              bg-team-${task.assignee.color} ${showMemberHighlight ? 'ring-2 ring-team-' + task.assignee.color + '/30' : ''}
            `}
          >
            {task.assignee.avatar}
          </div>
          
          {/* Actions Menu */}
          {teamMembers && onUpdateTask && onDeleteTask && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditTaskDialog
                  task={task}
                  teamMembers={teamMembers}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Edit Task
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Task title */}
      <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer with date range, due date, timing info and warnings */}
      <div className="space-y-2">
        {/* Date Range */}
        {(task.startDate || task.endDate) && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded">
            <Play className="w-3 h-3 text-status-ongoing" />
            <span className="text-muted-foreground">
              {task.startDate && formatDate(task.startDate)}
              {task.startDate && task.endDate && " → "}
              {task.endDate && formatDate(task.endDate)}
            </span>
            <Square className="w-3 h-3 text-status-finished" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-status-overdue' : 'text-muted-foreground'}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
          
          {isStuck && (
            <div className="flex items-center gap-1 text-status-ongoing">
              <Clock className="w-3 h-3" />
              <span>Stuck</span>
            </div>
          )}
        </div>
        
        {/* Time tracking info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
              #{task.id.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Created {daysSinceCreation}d ago</span>
            <span className={daysSinceUpdate >= 3 ? 'text-status-ongoing' : ''}>
              Updated {daysSinceUpdate}d ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}