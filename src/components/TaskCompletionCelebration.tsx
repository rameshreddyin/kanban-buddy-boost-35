import { useEffect, useState } from "react";
import { Task } from "@/types/kanban";

interface TaskCompletionCelebrationProps {
  completedTask: Task | null;
  onAnimationEnd: () => void;
}

export function TaskCompletionCelebration({ 
  completedTask, 
  onAnimationEnd 
}: TaskCompletionCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (completedTask) {
      setIsVisible(true);
      
      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationEnd();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [completedTask, onAnimationEnd]);

  if (!completedTask || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Confetti-like particles */}
      <div className="relative">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-3 h-3 rounded-full animate-bounce
              ${i % 4 === 0 ? 'bg-status-finished' : ''}
              ${i % 4 === 1 ? 'bg-primary' : ''}
              ${i % 4 === 2 ? 'bg-status-ongoing' : ''}
              ${i % 4 === 3 ? 'bg-gradient-primary' : ''}
            `}
            style={{
              left: `${Math.cos((i * 30) * Math.PI / 180) * 100}px`,
              top: `${Math.sin((i * 30) * Math.PI / 180) * 100}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
        
        {/* Center celebration message */}
        <div className="animate-scale-in bg-gradient-card border border-status-finished/50 rounded-xl p-6 shadow-glow text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-bold text-lg text-status-finished mb-1">
            Task Completed!
          </h3>
          <p className="text-sm text-muted-foreground">
            "{completedTask.title}"
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div 
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                bg-team-${completedTask.assignee.color}
              `}
            >
              {completedTask.assignee.avatar}
            </div>
            <span className="text-xs text-muted-foreground">
              {completedTask.assignee.name}
            </span>
          </div>
        </div>
      </div>
      
      {/* Background overlay with pulse effect */}
      <div className="absolute inset-0 bg-status-finished/5 animate-pulse" />
    </div>
  );
}