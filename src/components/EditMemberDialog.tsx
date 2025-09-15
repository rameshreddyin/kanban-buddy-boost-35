import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { TeamMember } from "@/types/kanban";

interface EditMemberDialogProps {
  teamMembers: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
}

export function EditMemberDialog({ teamMembers, onUpdateMembers }: EditMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...members];
    if (field === 'color') {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value as 'alex' | 'sarah' | 'mike' };
    } else {
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    }
    setMembers(updatedMembers);
  };

  const handleSave = () => {
    onUpdateMembers(members);
    setOpen(false);
  };

  const handleCancel = () => {
    setMembers(teamMembers); // Reset to original
    setOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const colorOptions = [
    { value: 'alex', label: 'Blue', color: 'hsl(217, 91%, 60%)' },
    { value: 'sarah', label: 'Purple', color: 'hsl(262, 83%, 58%)' },
    { value: 'mike', label: 'Green', color: 'hsl(142, 76%, 36%)' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Edit Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Edit Team Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {members.map((member, index) => (
            <div key={member.id} className="bg-background/50 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white`}
                  style={{ backgroundColor: colorOptions.find(c => c.value === member.color)?.color }}
                >
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground">Member {index + 1}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="text-card-foreground">Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder="Enter name..."
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`avatar-${index}`} className="text-card-foreground">Avatar (2 letters)</Label>
                  <Input
                    id={`avatar-${index}`}
                    value={member.avatar}
                    onChange={(e) => updateMember(index, 'avatar', e.target.value.slice(0, 2).toUpperCase())}
                    placeholder="Initials..."
                    maxLength={2}
                    className="bg-background border-border text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateMember(index, 'avatar', getInitials(member.name))}
                    className="w-full text-xs"
                  >
                    Auto-generate
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`color-${index}`} className="text-card-foreground">Color Theme</Label>
                  <Select 
                    value={member.color} 
                    onValueChange={(value) => updateMember(index, 'color', value)}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: option.color }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}