import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { ArrowLeft, Users, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  classes: { id: string; name: string; section: string | null }[];
}

const Students = () => {
  const navigate = useNavigate();
  const { user, loading: roleLoading, isAdmin } = useUserRole();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !user) {
      navigate("/auth");
    }
    if (!roleLoading && !isAdmin) {
      toast({ title: "Access denied", description: "Only admins can view this page", variant: "destructive" });
      navigate("/dashboard");
    }
  }, [user, roleLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStudents();
    }
  }, [isAdmin]);

  const fetchStudents = async () => {
    // Get all users with student role
    const { data: studentRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    if (rolesError) {
      toast({ title: "Error fetching students", variant: "destructive" });
      setLoading(false);
      return;
    }

    const studentUserIds = studentRoles?.map(r => r.user_id) || [];

    if (studentUserIds.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    // Get profiles for these students
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email")
      .in("user_id", studentUserIds);

    if (profilesError) {
      toast({ title: "Error fetching student profiles", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Get student_classes for each student
    const { data: studentClasses, error: classesError } = await supabase
      .from("student_classes")
      .select("student_id, class_id, classes:class_id(id, name, section)")
      .in("student_id", studentUserIds);

    if (classesError) {
      toast({ title: "Error fetching student classes", variant: "destructive" });
    }

    // Map students with their classes
    const studentsWithClasses: Student[] = (profiles || []).map(profile => {
      const classes = (studentClasses || [])
        .filter(sc => sc.student_id === profile.user_id)
        .map(sc => sc.classes as unknown as { id: string; name: string; section: string | null })
        .filter(Boolean);
      
      return {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name || "Unknown",
        email: profile.email || "",
        classes
      };
    });

    setStudents(studentsWithClasses);
    setLoading(false);
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">All Students</h1>
                <p className="text-sm text-muted-foreground">View all registered students</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {students.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students registered yet</p>
              <Button className="mt-4" onClick={() => navigate("/add-student")}>
                Add First Student
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Registered Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Classes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.classes.map((cls) => (
                              <span
                                key={cls.id}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                              >
                                {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No classes assigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Students;
