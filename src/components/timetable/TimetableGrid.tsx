import { Clock } from "lucide-react";

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { name: string; code: string } | null;
  teacher: { full_name: string | null; email: string | null } | null;
  class: { name: string; section: string | null } | null;
}

interface TimetableGridProps {
  entries: TimetableEntry[];
  onEntryClick?: (entry: TimetableEntry) => void;
  showTeacher?: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

export const TimetableGrid = ({ entries, onEntryClick, showTeacher = true }: TimetableGridProps) => {
  const getEntryForSlot = (day: number, time: string) => {
    return entries.find(entry => {
      const entryStart = entry.start_time.slice(0, 5);
      return entry.day_of_week === day && entryStart === time;
    });
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}PM` : `${hour}AM`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="p-3 text-center text-sm font-medium text-muted-foreground">
            <Clock className="w-4 h-4 mx-auto" />
          </div>
          {DAYS.slice(1, 7).concat(DAYS[0]).map((day, index) => (
            <div key={day} className="p-3 text-center text-sm font-medium bg-muted rounded-lg">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-3 text-center text-sm text-muted-foreground flex items-center justify-center">
              {formatTime(time)}
            </div>
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const entry = getEntryForSlot(day, time);
              return (
                <div
                  key={`${day}-${time}`}
                  onClick={() => entry && onEntryClick?.(entry)}
                  className={`min-h-[80px] p-2 rounded-xl border transition-all ${
                    entry
                      ? "bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/20"
                      : "bg-muted/30 border-border"
                  }`}
                >
                  {entry && (
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-primary truncate">
                        {entry.subject?.name || "Unknown"}
                      </div>
                      {entry.room && (
                        <div className="text-muted-foreground">Room {entry.room}</div>
                      )}
                      {showTeacher && entry.teacher && (
                        <div className="text-muted-foreground truncate">
                          {entry.teacher.full_name || entry.teacher.email?.split("@")[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
