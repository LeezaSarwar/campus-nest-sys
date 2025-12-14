import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { TimetableForm } from "@/components/timetable/TimetableForm";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TimetableEntry {
  id: string;
  class_id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { name: string; code: string } | null;
  teacher: { full_name: string | null; email: string | null } | null;
  class: { name: string; section: string | null } | null;
}

const Timetable = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, isTeacher } = useUserRole();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string | null }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, section")
        .order("grade_level", { ascending: false });

      if (data && data.length > 0) {
        setClasses(data);
        setSelectedClass(data[0].id);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`
          id,
          class_id,
          subject_id,
          teacher_id,
          day_of_week,
          start_time,
          end_time,
          room,
          subject:subjects(name, code),
          class:classes(name, section)
        `)
        .eq("class_id", selectedClass)
        .order("day_of_week")
        .order("start_time");

      // Fetch teacher profiles separately if there are entries with teacher_id
      const teacherIds = (data || []).map((e: any) => e.teacher_id).filter(Boolean);
      let teacherMap: Record<string, { full_name: string | null; email: string | null }> = {};
      
      if (teacherIds.length > 0) {
        const { data: teachers } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", teacherIds);
        
        (teachers || []).forEach((t: any) => {
          teacherMap[t.user_id] = { full_name: t.full_name, email: t.email };
        });
      }

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((entry: any) => ({
        ...entry,
        subject: entry.subject,
        teacher: entry.teacher_id ? teacherMap[entry.teacher_id] || null : null,
        class: entry.class,
      }));
      
      setEntries(transformedData);
    } catch (error: any) {
      toast({
        title: "Error fetching timetable",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEntryClick = (entry: TimetableEntry) => {
    if (isTeacher) {
      setSelectedEntry(entry);
      setDialogOpen(true);
    }
  };

  const handleAddNew = () => {
    setSelectedEntry(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
    fetchTimetable();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold">EduManage</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={fetchTimetable}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              {isTeacher && (
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Class Timetable
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher
                ? "Manage and update class schedules"
                : "View your class schedule"}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
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
        </div>

        {/* Timetable Grid */}
        <div className="bg-card rounded-2xl border border-border p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Timetable Entries</h3>
              <p className="text-muted-foreground mb-4">
                {isTeacher
                  ? "Start by adding class periods to the timetable"
                  : "No schedule available for this class yet"}
              </p>
              {isTeacher && (
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </div>
          ) : (
            <TimetableGrid
              entries={entries}
              onEntryClick={handleEntryClick}
              showTeacher={!isTeacher}
            />
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10 border border-primary/30" />
            <span>Scheduled Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30 border border-border" />
            <span>Free Period</span>
          </div>
          {isTeacher && (
            <div className="text-primary">
              Click on any entry to edit or delete
            </div>
          )}
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
            </DialogTitle>
          </DialogHeader>
          <TimetableForm
            entry={selectedEntry}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetable;
