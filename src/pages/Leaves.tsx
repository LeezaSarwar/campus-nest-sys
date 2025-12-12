import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Plus, Check, X } from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/useUserRole";

interface LeaveRequest {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  sent_to: "teacher" | "admin";
  created_at: string;
  student_name?: string;
}

const Leaves = () => {
  const navigate = useNavigate();
  const { role, userId, loading: roleLoading } = useUserRole();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    sentTo: "admin" as "teacher" | "admin",
  });

  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";
  const isTeacherOrAdmin = isTeacher || isAdmin;

  useEffect(() => {
    if (!roleLoading) {
      fetchLeaves();
    }
  }, [roleLoading, userId, role]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let query = supabase.from("leaves").select("*").order("created_at", { ascending: false });

      // Students see only their own leaves
      if (role === "student" && userId) {
        query = query.eq("student_id", userId);
      }
      // Teachers see only leaves sent to them
      else if (isTeacher) {
        query = query.eq("sent_to", "teacher");
      }
      // Admins see only leaves sent to them
      else if (isAdmin) {
        query = query.eq("sent_to", "admin");
      }

      const { data } = await query;

      if (data) {
        // Fetch student names
        const studentIds = [...new Set(data.map((l) => l.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", studentIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach((p) => {
          profileMap[p.user_id] = p.full_name || "Unknown";
        });

        setLeaves(
          data.map((l) => ({
            ...l,
            status: l.status as "pending" | "approved" | "rejected",
            sent_to: (l.sent_to || "admin") as "teacher" | "admin",
            student_name: profileMap[l.student_id] || "Unknown",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("leaves").insert({
        student_id: userId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        status: "pending",
        sent_to: formData.sentTo,
      });

      if (error) throw error;

      toast({
        title: "Leave request submitted",
        description: `Your leave request has been sent to ${formData.sentTo} for approval.`,
      });

      setDialogOpen(false);
      setFormData({ startDate: "", endDate: "", reason: "", sentTo: "admin" });
      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error submitting leave",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("leaves")
        .update({ status, approved_by: userId })
        .eq("id", leaveId);

      if (error) throw error;

      toast({
        title: `Leave ${status}`,
        description: `The leave request has been ${status}.`,
      });

      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error updating leave",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const variants: Record<LeaveRequest["status"], { variant: "default" | "destructive" | "secondary"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    return variants[status];
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse" />
      </div>
    );
  }

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
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Leave Management</CardTitle>
                  {isTeacherOrAdmin && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing leaves sent to {isAdmin ? "Admin" : "Teacher"}
                    </p>
                  )}
                </div>
              </div>
              {role === "student" && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Request Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitLeave} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startDate: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData({ ...formData, endDate: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter reason for leave..."
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                          required
                          rows={4}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Send Request To</Label>
                        <RadioGroup
                          value={formData.sentTo}
                          onValueChange={(value) =>
                            setFormData({ ...formData, sentTo: value as "teacher" | "admin" })
                          }
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="teacher" id="teacher" />
                            <Label htmlFor="teacher" className="cursor-pointer">Send to Teacher</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="admin" id="admin" />
                            <Label htmlFor="admin" className="cursor-pointer">Send to Admin</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Request"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {leaves.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isTeacherOrAdmin && <TableHead>Student</TableHead>}
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Reason</TableHead>
                      {role === "student" && <TableHead>Sent To</TableHead>}
                      <TableHead>Status</TableHead>
                      {isTeacherOrAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        {isTeacherOrAdmin && (
                          <TableCell className="font-medium">{leave.student_name}</TableCell>
                        )}
                        <TableCell>{format(new Date(leave.start_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(leave.end_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                        {role === "student" && (
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {leave.sent_to}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant={getStatusBadge(leave.status).variant}>
                            {getStatusBadge(leave.status).label}
                          </Badge>
                        </TableCell>
                        {isTeacherOrAdmin && (
                          <TableCell>
                            {leave.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success hover:text-success"
                                  onClick={() => handleUpdateStatus(leave.id, "approved")}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleUpdateStatus(leave.id, "rejected")}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No leave requests found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaves;