-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('alex', 'sarah', 'mike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create columns table
CREATE TABLE public.columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('backlog', 'ongoing', 'finished')),
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members (public read/write for now)
CREATE POLICY "Anyone can view team members" 
ON public.team_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update team members" 
ON public.team_members 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete team members" 
ON public.team_members 
FOR DELETE 
USING (true);

-- Create policies for columns (public read/write for now)
CREATE POLICY "Anyone can view columns" 
ON public.columns 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create columns" 
ON public.columns 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update columns" 
ON public.columns 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete columns" 
ON public.columns 
FOR DELETE 
USING (true);

-- Create policies for tasks (public read/write for now)
CREATE POLICY "Anyone can view tasks" 
ON public.tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_columns_updated_at
  BEFORE UPDATE ON public.columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.team_members (name, avatar, color) VALUES
  ('Alex Chen', 'AC', 'alex'),
  ('Sarah Williams', 'SW', 'sarah'),
  ('Mike Johnson', 'MJ', 'mike');

INSERT INTO public.columns (title, color, position) VALUES
  ('Backlog', 'backlog', 1),
  ('Ongoing', 'ongoing', 2),
  ('Finished', 'finished', 3);