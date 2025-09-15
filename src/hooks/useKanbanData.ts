import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KanbanData, Task, TeamMember, Column } from '@/types/kanban';
import { useToast } from '@/hooks/use-toast';

export const useKanbanData = () => {
  const [data, setData] = useState<KanbanData>({ tasks: {}, columns: {}, columnOrder: [] });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    const { data: members, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
      return [];
    }

    return members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      color: member.color as 'alex' | 'sarah' | 'mike'
    }));
  };

  const fetchColumns = async () => {
    const { data: columns, error } = await supabase
      .from('columns')
      .select('*')
      .order('position');

    if (error) {
      toast({
        title: "Error", 
        description: "Failed to fetch columns",
        variant: "destructive",
      });
      return { columns: {}, columnOrder: [] };
    }

    const columnsObj: Record<string, Column> = {};
    const columnOrder: string[] = [];

    columns.forEach(col => {
      columnsObj[col.id] = {
        id: col.id,
        title: col.title,
        taskIds: [],
        color: col.color as 'backlog' | 'ongoing' | 'finished'
      };
      columnOrder.push(col.id);
    });

    return { columns: columnsObj, columnOrder };
  };

  const fetchTasks = async (members: TeamMember[]) => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, team_members(*)')
      .order('position');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks", 
        variant: "destructive",
      });
      return {};
    }

    const tasksObj: Record<string, Task> = {};

    tasks.forEach(task => {
      const assignee = members.find(m => m.id === task.assignee_id);
      if (assignee) {
        tasksObj[task.id] = {
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          assignee,
          priority: task.priority as 'low' | 'medium' | 'high',
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          startDate: task.start_date ? new Date(task.start_date) : undefined,
          endDate: task.end_date ? new Date(task.end_date) : undefined,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          tags: task.tags || []
        };
      }
    });

    return tasksObj;
  };

  const updateColumnTaskIds = async (columns: Record<string, Column>, tasks: Record<string, Task>) => {
    const { data: dbTasks } = await supabase
      .from('tasks')
      .select('id, column_id')
      .order('position');

    if (dbTasks) {
      Object.keys(columns).forEach(colId => {
        columns[colId].taskIds = dbTasks
          .filter(task => task.column_id === colId)
          .map(task => task.id);
      });
    }

    return columns;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const members = await fetchTeamMembers();
      setTeamMembers(members);

      const { columns, columnOrder } = await fetchColumns();
      const tasks = await fetchTasks(members);
      const updatedColumns = await updateColumnTaskIds(columns, tasks);

      setData({
        tasks,
        columns: updatedColumns,
        columnOrder
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load kanban data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, teamMembers, loading, refetch: loadData };
};