import { Column, Task, TeamMember } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  teamMembers: TeamMember[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanColumn({ 
  column, 
  tasks, 
  teamMembers, 
  onCreateTask, 
  onUpdateTask, 
  onDeleteTask 
}: KanbanColumnProps) {
  const getColumnStatusColor = () => {
    switch (column.color) {
      case 'backlog':
        return 'border-status-backlog/30 bg-status-backlog/5';
      case 'ongoing':
        return 'border-status-ongoing/30 bg-status-ongoing/5';
      case 'finished':
        return 'border-status-finished/30 bg-status-finished/5';
    }
  };

  const getHeaderColor = () => {
    switch (column.color) {
      case 'backlog':
        return 'text-status-backlog';
      case 'ongoing':
        return 'text-status-ongoing';
      case 'finished':
        return 'text-status-finished';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className={`font-bold text-lg ${getHeaderColor()}`}>
            {column.title}
          </h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        {column.id === 'backlog' && (
          <CreateTaskDialog 
            teamMembers={teamMembers}
            onCreateTask={onCreateTask}
          />
        )}
      </div>

      {/* Scrollable Tasks Area */}
      <div className="flex-1 overflow-hidden">
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <ScrollArea className="h-full">
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  rounded-lg border-2 border-dashed p-3 transition-colors duration-200 space-y-3
                  ${snapshot.isDraggingOver ? getColumnStatusColor() : 'border-border/30'}
                  min-h-[500px]
                `}
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                        className="animate-fade-in"
                      >
                        <TaskCard 
                          task={task} 
                          isDragging={snapshot.isDragging}
                          teamMembers={teamMembers}
                          onUpdateTask={onUpdateTask}
                          onDeleteTask={onDeleteTask}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {tasks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p>Drop tasks here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </Droppable>
      </div>
    </div>
  );
}