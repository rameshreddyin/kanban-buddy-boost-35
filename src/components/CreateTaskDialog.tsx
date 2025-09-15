import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, CalendarIcon, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { TeamMember, Task } from "@/types/kanban";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskDialogProps {
  teamMembers: TeamMember[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function CreateTaskDialog({ teamMembers, onCreateTask }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const { toast } = useToast();

  // Action words that make tasks more actionable
  const actionWords = ['create', 'build', 'design', 'implement', 'fix', 'update', 'review', 'test', 'deploy', 'research', 'analyze', 'write', 'develop', 'optimize', 'refactor', 'debug', 'configure', 'setup', 'integrate'];
  
  const validateTask = () => {
    const newErrors: { title?: string; description?: string } = {};
    
    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 10) {
      newErrors.title = "Title should be at least 10 characters for clarity";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title should be under 100 characters";
    } else {
      const titleLower = title.toLowerCase();
      const hasActionWord = actionWords.some(word => titleLower.includes(word));
      if (!hasActionWord) {
        newErrors.title = "Consider starting with an action word (create, build, fix, etc.)";
      }
    }
    
    // Description validation for better tasks
    if (description.trim() && description.trim().length < 20) {
      newErrors.description = "Add more details to make this task clearer (at least 20 characters)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isTaskActionable = () => {
    const titleLower = title.toLowerCase();
    const hasActionWord = actionWords.some(word => titleLower.includes(word));
    const hasGoodLength = title.trim().length >= 10 && title.trim().length <= 100;
    const hasDescription = description.trim().length >= 20;
    
    return hasActionWord && hasGoodLength && hasDescription;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTask()) {
      toast({
        title: "Task needs improvement",
        description: "Please address the validation errors to create an actionable task",
        variant: "destructive",
      });
      return;
    }
    
    const assignee = teamMembers.find(m => m.id === assigneeId);
    if (!assignee) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      assignee,
      priority,
      tags,
      startDate,
      endDate,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    onCreateTask(newTask);
    
    toast({
      title: "✅ Actionable task created!",
      description: `"${title.trim()}" has been added to the backlog`,
    });
    
    // Reset form
    setTitle("");
    setDescription("");
    setPriority('medium');
    setAssigneeId("");
    setTags([]);
    setCurrentTag("");
    setStartDate(undefined);
    setEndDate(undefined);
    setDueDate("");
    setErrors({});
    setOpen(false);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Create Actionable Task</DialogTitle>
        </DialogHeader>
        
        {/* Guidelines */}
        <Alert className="bg-primary/5 border-primary/20">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Create actionable tasks:</strong> Start with action verbs (create, build, fix), be specific about what needs to be done, and include enough detail for the assignee to understand the task.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground flex items-center gap-2">
              Title *
              {isTaskActionable() && <CheckCircle className="h-4 w-4 text-status-finished" />}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              placeholder="e.g., Create user authentication flow, Fix payment gateway bug, Build dashboard component..."
              required
              className={cn(
                "bg-background border-border text-foreground",
                errors.title && "border-status-overdue focus:border-status-overdue"
              )}
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-status-overdue text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Good examples: "Create login page", "Fix mobile responsive layout", "Write API documentation"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground flex items-center gap-2">
              Description
              {description.trim().length >= 20 && <CheckCircle className="h-4 w-4 text-status-finished" />}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              placeholder="Describe the task in detail. What exactly needs to be done? Include acceptance criteria, requirements, or expected outcomes..."
              className={cn(
                "bg-background border-border text-foreground",
                errors.description && "border-status-overdue focus:border-status-overdue"
              )}
              rows={4}
            />
            {errors.description && (
              <div className="flex items-center gap-2 text-status-overdue text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {description.length}/200 characters • Add specific details to help the assignee understand what needs to be accomplished
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-card-foreground">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-card-foreground">Assignee *</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-team-${member.color} flex items-center justify-center text-xs font-bold text-white`}>
                          {member.avatar}
                        </div>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-card-foreground">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-card-foreground">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag and press Enter..."
                className="bg-background border-border text-foreground"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {isTaskActionable() ? (
                <div className="flex items-center gap-2 text-status-finished">
                  <CheckCircle className="h-4 w-4" />
                  Task looks actionable!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-status-ongoing">
                  <AlertCircle className="h-4 w-4" />
                  Make it more actionable
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!title.trim() || !assigneeId}
                className={cn(isTaskActionable() && "bg-status-finished hover:bg-status-finished/90")}
              >
                {isTaskActionable() ? "Create Actionable Task" : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}