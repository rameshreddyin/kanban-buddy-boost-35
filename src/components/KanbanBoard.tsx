import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanData, TeamMember, Task } from "@/types/kanban";
import { KanbanColumn } from "./KanbanColumn";
import { FinishedColumn } from "./FinishedColumn";
import { WeeklyStatsPanel } from "./WeeklyStatsPanel";
import { EditMemberDialog } from "./EditMemberDialog";
import { WeekDateEditor } from "./WeekDateEditor";
import { TaskCompletionCelebration } from "./TaskCompletionCelebration";
import { teamMembers as initialTeamMembers, mockWeeklyStats } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { startOfWeek, endOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  initialData: KanbanData;
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [data, setData] = useState(initialData);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [weekStartDate, setWeekStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekEndDate, setWeekEndDate] = useState<Date>(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleUpdateWeekDates = (startDate: Date, endDate: Date) => {
    setWeekStartDate(startDate);
    setWeekEndDate(endDate);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [newTask.id]: newTask,
      },
      columns: {
        ...prev.columns,
        backlog: {
          ...prev.columns.backlog,
          taskIds: [...prev.columns.backlog.taskIds, newTask.id],
        },
      },
    }));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          ...updates,
          updatedAt: new Date(),
        },
      },
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setData(prev => {
      // Remove task from tasks
      const { [taskId]: deletedTask, ...remainingTasks } = prev.tasks;
      
      // Remove task from all columns
      const updatedColumns = { ...prev.columns };
      Object.keys(updatedColumns).forEach(columnId => {
        updatedColumns[columnId] = {
          ...updatedColumns[columnId],
          taskIds: updatedColumns[columnId].taskIds.filter(id => id !== taskId),
        };
      });

      return {
        ...prev,
        tasks: remainingTasks,
        columns: updatedColumns,
      };
    });
  };

  const handleUpdateMembers = (updatedMembers: TeamMember[]) => {
    setTeamMembers(updatedMembers);
    
    // Update existing tasks to reflect member changes
    const updatedTasks = { ...data.tasks };
    Object.keys(updatedTasks).forEach(taskId => {
      const task = updatedTasks[taskId];
      const updatedMember = updatedMembers.find(m => m.id === task.assignee.id);
      if (updatedMember) {
        updatedTasks[taskId] = {
          ...task,
          assignee: updatedMember,
        };
      }
    });

    setData(prev => ({
      ...prev,
      tasks: updatedTasks,
    }));
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

    const start = data.columns[sourceColumnId];
    const finish = data.columns[destColumnId];

    if (start === finish) {
      // Moving within the same column
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
    } else {
      // Moving to a different column
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      };

      // Update task's updatedAt timestamp
      const updatedTask = {
        ...data.tasks[draggableId],
        updatedAt: new Date(),
      };

      // Check if task was completed (moved to finished column)
      const isTaskCompleted = destColumnId === 'finished' && sourceColumnId !== 'finished';
      
      if (isTaskCompleted) {
        // Trigger celebration
        setCompletedTask(updatedTask);
        
        // Show success toast
        toast({
          title: "🎉 Task Completed!",
          description: `"${updatedTask.title}" has been finished by ${updatedTask.assignee.name}`,
          duration: 4000,
        });
      }

      setData({
        ...data,
        tasks: {
          ...data.tasks,
          [draggableId]: updatedTask,
        },
        columns: {
          ...data.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      });
    }
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