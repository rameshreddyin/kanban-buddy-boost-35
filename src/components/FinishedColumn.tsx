import { Column, Task, TeamMember } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinishedColumnProps {
  column: Column;
  tasks: Task[];
  teamMembers: TeamMember[];
}

export function FinishedColumn({ column, tasks, teamMembers }: FinishedColumnProps) {
  const getColumnStatusColor = () => 'border-status-finished/30 bg-status-finished/5';
  const getHeaderColor = () => 'text-status-finished';

  // Get member stats for header info
  const memberStats = teamMembers.map(member => ({
    ...member,
    taskCount: tasks.filter(task => task.assignee.id === member.id).length
  }));

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
      </div>

      {/* Member Summary */}
      <div className="flex items-center gap-2 mb-4 px-2 flex-shrink-0">
        {memberStats.map((member) => (
          <div key={member.id} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-full">
            <div 
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-team-${member.color}`}
            >
              {member.avatar}
            </div>
            <span className="text-muted-foreground">{member.taskCount}</span>
          </div>
        ))}
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
                  rounded-lg border-2 border-dashed p-3 transition-colors duration-200 min-h-[500px] space-y-3
                  ${snapshot.isDraggingOver ? getColumnStatusColor() : 'border-border/30'}
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
                      >
                            <TaskCard 
                              task={task} 
                              isDragging={snapshot.isDragging} 
                              showMemberHighlight={true}
                              teamMembers={teamMembers}
                            />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {tasks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="text-4xl mb-2">✅</div>
                    <p>No completed tasks yet</p>
                    <p className="text-xs mt-1">Tasks moved here will appear in this scrollable list</p>
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