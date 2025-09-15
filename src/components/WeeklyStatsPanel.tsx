import { WeeklyStats, TeamMember } from "@/types/kanban";
import { Trophy, Target, Clock, AlertTriangle } from "lucide-react";

interface WeeklyStatsPanelProps {
  stats: WeeklyStats;
  teamMembers: TeamMember[];
}

export function WeeklyStatsPanel({ stats, teamMembers }: WeeklyStatsPanelProps) {
  const getTopPerformer = () => {
    const membersWithStats = teamMembers
      .map(member => ({
        ...member,
        stats: stats.memberStats[member.id] || {
          completed: 0,
          inProgress: 0,
          overdue: 0,
          score: 0
        }
      }))
      .filter(member => member.stats);
    
    if (membersWithStats.length === 0) {
      return teamMembers[0] ? {
        ...teamMembers[0],
        stats: { completed: 0, inProgress: 0, overdue: 0, score: 0 }
      } : null;
    }
    
    return membersWithStats.sort((a, b) => b.stats.score - a.stats.score)[0];
  };

  const getTotalStats = () => {
    const memberStats = Object.values(stats.memberStats);
    return {
      completed: memberStats.reduce((sum, stat) => sum + stat.completed, 0),
      inProgress: memberStats.reduce((sum, stat) => sum + stat.inProgress, 0),
      overdue: memberStats.reduce((sum, stat) => sum + stat.overdue, 0)
    };
  };

  const topPerformer = getTopPerformer();
  const totalStats = getTotalStats();

  if (!topPerformer) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Weekly Progress Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Weekly Progress</span>
            </div>
            
            {/* Top Performer */}
            <div className="flex items-center gap-2">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-team-${topPerformer.color}`}
              >
                {topPerformer.avatar}
              </div>
              <div className="text-sm">
                <span className="font-medium">{topPerformer.name}</span>
                <span className="text-muted-foreground ml-1">leads with</span>
                <span className="font-bold text-status-finished ml-1">{topPerformer.stats.score}</span>
              </div>
            </div>
          </div>

          {/* Team Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-status-finished" />
              <span className="font-bold text-status-finished">{totalStats.completed}</span>
              <span className="text-sm text-muted-foreground">done</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-status-ongoing" />
              <span className="font-bold text-status-ongoing">{totalStats.inProgress}</span>
              <span className="text-sm text-muted-foreground">active</span>
            </div>
            {totalStats.overdue > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-status-overdue" />
                <span className="font-bold text-status-overdue">{totalStats.overdue}</span>
                <span className="text-sm text-muted-foreground">overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}