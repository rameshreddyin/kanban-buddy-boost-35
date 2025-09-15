import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface WeekDateEditorProps {
  startDate: Date;
  endDate: Date;
  onUpdateDates: (startDate: Date, endDate: Date) => void;
}

export function WeekDateEditor({ startDate, endDate, onUpdateDates }: WeekDateEditorProps) {
  const [open, setOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState<Date>(startDate);
  const [newEndDate, setNewEndDate] = useState<Date>(endDate);

  const handleSubmit = () => {
    onUpdateDates(newStartDate, newEndDate);
    setOpen(false);
  };

  const handleReset = () => {
    setNewStartDate(startDate);
    setNewEndDate(endDate);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-fit p-2 hover:bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium">Current Week</div>
              <div className="text-xs text-muted-foreground">
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </div>
            </div>
            <Edit3 className="h-3 w-3 text-muted-foreground" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Edit Week Dates</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Week Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border text-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newStartDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newStartDate}
                    onSelect={(date) => date && setNewStartDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Week End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border text-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newEndDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEndDate}
                    onSelect={(date) => date && setNewEndDate(date)}
                    disabled={(date) => date < newStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Duration:</strong> {Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Update Week
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}