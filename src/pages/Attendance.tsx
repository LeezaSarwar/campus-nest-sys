import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ClipboardCheck, Save, Plus } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

type AttendanceStatus = "present" | "absent" | "late";

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  class_name?: string;
}

const Attendance = () => {
  const navigate = useNavigate();
  const { role, userId, loading: roleLoading } = useUserRole();
  const [classes, setClasses] = useState<{ id: string; name: string; section: string | null }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [studentAttendance, setStudentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMarkingMode, setShowMarkingMode] = useState(false);

  const isTeacherOrAdmin = role === "teacher" || role === "admin";
  const isStudent = role === "student";

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from("classes").select("id, name, section");
      if (data) setClasses(data);
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (isStudent && userId) {
      fetchStudentAttendance();
    }
  }, [isStudent, userId]);

  useEffect(() => {
    if (selectedClass && showMarkingMode) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate, showMarkingMode]);

  const fetchStudentAttendance = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("id, date, status, class_id")
        .eq("student_id", userId)
        .order("date", { ascending: false })
        .limit(30);

      if (attendanceData) {
        // Fetch class names
        const classIds = [...new Set(attendanceData.map((a) => a.class_id).filter(Boolean))];
        const { data: classData } = await supabase
          .from("classes")
          .select("id, name")
          .in("id", classIds);

        const classMap: Record<string, string> = {};
        classData?.forEach((c) => {
          classMap[c.id] = c.name;
        });

        setStudentAttendance(
          attendanceData.map((a) => ({
            id: a.id,
            date: a.date,
            status: a.status as AttendanceStatus,
            class_name: a.class_id ? classMap[a.class_id] : undefined,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch students in the class
      const { data: studentClasses } = await supabase
        .from("student_classes")
        .select("student_id")
        .eq("class_id", selectedClass);

      if (studentClasses && studentClasses.length > 0) {
        const studentIds = studentClasses.map((sc) => sc.student_id);
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", studentIds);

        if (profiles) {
          setStudents(
            profiles.map((p) => ({
              id: p.user_id,
              full_name: p.full_name || "Unknown",
              email: p.email || "",
            }))
          );
        }

        // Fetch existing attendance
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("student_id, status")
          .eq("class_id", selectedClass)
          .eq("date", selectedDate);

        if (attendanceData) {
          const attendanceMap: Record<string, AttendanceStatus> = {};
          attendanceData.forEach((a) => {
            attendanceMap[a.student_id] = a.status as AttendanceStatus;
          });
          setAttendance(attendanceMap);
        }
      } else {
        setStudents([]);
        setAttendance({});
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Delete existing attendance for this class and date
      await supabase
        .from("attendance")
        .delete()
        .eq("class_id", selectedClass)
        .eq("date", selectedDate);

      // Insert new attendance records
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        class_id: selectedClass,
        date: selectedDate,
        status,
        marked_by: user?.id,
      }));

      if (records.length > 0) {
        const { error } = await supabase.from("attendance").insert(records);
        if (error) throw error;
      }

      toast({
        title: "Attendance saved",
        description: `Attendance for ${format(new Date(selectedDate), "MMMM d, yyyy")} has been saved.`,
      });
    } catch (error: any) {
      toast({
        title: "Error saving attendance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, { variant: "default" | "destructive" | "secondary"; label: string }> = {
      present: { variant: "default", label: "Present" },
      absent: { variant: "destructive", label: "Absent" },
      late: { variant: "secondary", label: "Late" },
    };
    return variants[status];
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse" />
      </div>
    );
  }

  // Student view - show their own attendance
  if (isStudent) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">My Attendance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recent attendance records
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse" />
                </div>
              ) : studentAttendance.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{record.class_name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(record.status).variant}>
                              {getStatusBadge(record.status).label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No attendance records found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Teacher/Admin view
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Attendance Management</CardTitle>
              </div>
              <div className="flex gap-2">
                {!showMarkingMode ? (
                  <Button onClick={() => setShowMarkingMode(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attendance
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setShowMarkingMode(false)}>
                      Cancel
                    </Button>
                    {students.length > 0 && (
                      <Button onClick={handleSaveAttendance} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Attendance"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showMarkingMode ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Class</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} {cls.section ? `- ${cls.section}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse" />
                  </div>
                ) : selectedClass && students.length > 0 ? (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{student.email}</TableCell>
                            <TableCell>
                              <Select
                                value={attendance[student.id] || ""}
                                onValueChange={(value) =>
                                  handleStatusChange(student.id, value as AttendanceStatus)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Mark" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">Present</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="late">Late</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : selectedClass ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No students enrolled in this class yet.
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Select a class to mark attendance.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Click "Add Attendance" to start marking attendance for a class.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;