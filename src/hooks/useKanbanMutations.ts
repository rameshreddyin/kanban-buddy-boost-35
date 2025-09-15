import { supabase } from '@/integrations/supabase/client';
import { Task, TeamMember } from '@/types/kanban';
import { useToast } from '@/hooks/use-toast';

export const useKanbanMutations = (refetch: () => void) => {
  const { toast } = useToast();

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { columnId: string }) => {
    // Get current task count in column for positioning
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('column_id', taskData.columnId);

    const position = (tasks?.length || 0) + 1;

    const { error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        assignee_id: taskData.assignee.id,
        priority: taskData.priority,
        column_id: taskData.columnId,
        position,
        start_date: taskData.startDate?.toISOString(),
        end_date: taskData.endDate?.toISOString(),
        due_date: taskData.dueDate?.toISOString(),
        tags: taskData.tags
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task created successfully",
    });
    refetch();
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.assignee !== undefined) updateData.assignee_id = updates.assignee.id;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate?.toISOString();
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString();
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success", 
      description: "Task updated successfully",
    });
    refetch();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
    refetch();
  };

  const moveTask = async (taskId: string, sourceColumnId: string, destColumnId: string, newPosition: number) => {
    // Update task's column
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        column_id: destColumnId,
        position: newPosition 
      })
      .eq('id', taskId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
      return;
    }

    // Reorder other tasks in both columns
    if (sourceColumnId !== destColumnId) {
      // Update positions in source column
      const { data: sourceTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('column_id', sourceColumnId)
        .order('position');

      if (sourceTasks) {
        for (let i = 0; i < sourceTasks.length; i++) {
          await supabase
            .from('tasks')
            .update({ position: i + 1 })
            .eq('id', sourceTasks[i].id);
        }
      }
    }

    // Update positions in destination column
    const { data: destTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('column_id', destColumnId)
      .order('position');

    if (destTasks) {
      for (let i = 0; i < destTasks.length; i++) {
        await supabase
          .from('tasks')
          .update({ position: i + 1 })
          .eq('id', destTasks[i].id);
      }
    }

    refetch();
  };

  const updateMembers = async (members: TeamMember[]) => {
    // This is a simplified implementation - in a real app you'd want more sophisticated member management
    toast({
      title: "Info",
      description: "Member updates not yet implemented",
    });
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    updateMembers
  };
};