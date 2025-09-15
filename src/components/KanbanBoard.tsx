import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TeamMember, Task } from "@/types/kanban";
import { KanbanColumn } from "./KanbanColumn";
import { FinishedColumn } from "./FinishedColumn";
import { WeeklyStatsPanel } from "./WeeklyStatsPanel";
import { EditMemberDialog } from "./EditMemberDialog";
import { WeekDateEditor } from "./WeekDateEditor";
import { TaskCompletionCelebration } from "./TaskCompletionCelebration";
import { mockWeeklyStats } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useKanbanData } from "@/hooks/useKanbanData";
import { useKanbanMutations } from "@/hooks/useKanbanMutations";

interface KanbanBoardProps {}

export function KanbanBoard({}: KanbanBoardProps) {
  const { data, teamMembers, loading, refetch } = useKanbanData();
  const { createTask, updateTask, deleteTask, moveTask, updateMembers } = useKanbanMutations(refetch);
  
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekEndDate, setWeekEndDate] = useState<Date>(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background p-6 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleUpdateWeekDates = (startDate: Date, endDate: Date) => {
    setWeekStartDate(startDate);
    setWeekEndDate(endDate);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Find the backlog column ID
    const backlogColumn = Object.values(data.columns).find(col => col.color === 'backlog');
    if (backlogColumn) {
      createTask({ ...taskData, columnId: backlogColumn.id });
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleUpdateMembers = (updatedMembers: TeamMember[]) => {
    updateMembers(updatedMembers);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle finished column member sections
    const getColumnId = (droppableId: string) => {
      if (droppableId.startsWith('finished-')) {
        return 'finished';
      }
      return droppableId;
    };

    const sourceColumnId = getColumnId(source.droppableId);
    const destColumnId = getColumnId(destination.droppableId);

    // Check if task was completed (moved to finished column)
    const finishedColumn = Object.values(data.columns).find(col => col.color === 'finished');
    const isTaskCompleted = destColumnId === finishedColumn?.id && sourceColumnId !== finishedColumn?.id;
    
    if (isTaskCompleted) {
      const movedTask = data.tasks[draggableId];
      if (movedTask) {
        setCompletedTask(movedTask);
        toast({
          title: "🎉 Task Completed!",
          description: `"${movedTask.title}" has been finished by ${movedTask.assignee.name}`,
          duration: 4000,
        });
      }
    }

    // Move task in backend
    moveTask(draggableId, sourceColumnId, destColumnId, destination.index + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-background p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Team Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track progress, stay motivated, and crush your goals together
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <WeekDateEditor 
                startDate={weekStartDate}
                endDate={weekEndDate}
                onUpdateDates={handleUpdateWeekDates}
              />
              
              <Card className="px-4 py-2 bg-gradient-card border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{teamMembers.length} members</span>
                </div>
              </Card>
              
              <EditMemberDialog 
                teamMembers={teamMembers}
                onUpdateMembers={handleUpdateMembers}
              />
              
              <Card className="px-4 py-2 bg-gradient-card border-border">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-status-finished" />
                  <span className="font-medium">
                    {Object.values(data.tasks).filter(task => 
                      data.columns.finished.taskIds.includes(task.id)
                    ).length} tasks done
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                return (
                  <div key={column.id} className="h-full">
                    {columnId === 'finished' ? (
                      <FinishedColumn 
                        column={column} 
                        tasks={tasks} 
                        teamMembers={teamMembers} 
                      />
                    ) : (
                      <KanbanColumn 
                        column={column} 
                        tasks={tasks} 
                        teamMembers={teamMembers}
                        onCreateTask={handleCreateTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Sticky Bottom Progress Bar */}
      <WeeklyStatsPanel 
        stats={mockWeeklyStats} 
        teamMembers={teamMembers} 
      />
      
      {/* Task Completion Celebration */}
      <TaskCompletionCelebration
        completedTask={completedTask}
        onAnimationEnd={() => setCompletedTask(null)}
      />
    </>
  );
}