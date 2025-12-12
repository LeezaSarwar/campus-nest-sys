import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface TimetableFormProps {
  entry?: {
    id: string;
    class_id: string;
    subject_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

export const TimetableForm = ({ entry, onSuccess, onCancel }: TimetableFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string | null }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [classId, setClassId] = useState(entry?.class_id || "");
  const [subjectId, setSubjectId] = useState(entry?.subject_id || "");
  const [dayOfWeek, setDayOfWeek] = useState(entry?.day_of_week?.toString() || "1");
  const [startTime, setStartTime] = useState(entry?.start_time?.slice(0, 5) || "09:00");
  const [endTime, setEndTime] = useState(entry?.end_time?.slice(0, 5) || "10:00");
  const [room, setRoom] = useState(entry?.room || "");

  useEffect(() => {
    const fetchData = async () => {
      const [classesRes, subjectsRes] = await Promise.all([
        supabase.from("classes").select("id, name, section"),
        supabase.from("subjects").select("id, name"),
      ]);

      if (classesRes.data) setClasses(classesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const data = {
        class_id: classId,
        subject_id: subjectId,
        teacher_id: user.id,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        room: room || null,
      };

      if (entry) {
        const { error } = await supabase
          .from("timetable_entries")
          .update(data)
          .eq("id", entry.id);

        if (error) throw error;
        toast({ title: "Timetable updated successfully" });
      } else {
        const { error } = await supabase.from("timetable_entries").insert(data);
        if (error) throw error;
        toast({ title: "Timetable entry created" });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("timetable_entries")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;
      toast({ title: "Entry deleted" });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.section && `- ${c.section}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Day</Label>
        <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Room (optional)</Label>
        <Input
          placeholder="e.g., Room 101"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : entry ? "Update" : "Create"}
        </Button>
        {entry && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
