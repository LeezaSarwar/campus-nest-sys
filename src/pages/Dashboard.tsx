import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  ClipboardCheck,
  BarChart3,
  Upload,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/auth");
  };

  const userRole = (user?.user_metadata?.role as string) || "student";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const menuItems = [
    { icon: Home, label: "Dashboard", active: true, path: "/dashboard" },
    { icon: Users, label: "Users", path: "/dashboard" },
    { icon: BookOpen, label: "Classes", path: "/dashboard" },
    { icon: ClipboardCheck, label: "Attendance", path: "/dashboard" },
    { icon: FileText, label: "Exams", path: "/dashboard" },
    { icon: BarChart3, label: "Results", path: "/dashboard" },
    { icon: CreditCard, label: "Fees", path: "/dashboard" },
    { icon: Upload, label: "Materials", path: "/dashboard" },
    { icon: Calendar, label: "Timetable", path: "/timetable" },
    { icon: Bell, label: "Notifications", path: "/dashboard" },
  ];

  const stats = [
    { label: "Total Students", value: "2,456", change: "+12%", icon: Users, color: "bg-primary" },
    { label: "Active Classes", value: "48", change: "+5", icon: BookOpen, color: "bg-success" },
    { label: "Attendance Rate", value: "94.5%", change: "+2.3%", icon: ClipboardCheck, color: "bg-accent" },
    { label: "Pending Fees", value: "$12,450", change: "-8%", icon: CreditCard, color: "bg-destructive" },
  ];

  const recentActivities = [
    { title: "New student enrolled", desc: "John Smith joined Class 10-A", time: "2 min ago" },
    { title: "Exam results published", desc: "Mathematics Mid-term results", time: "1 hour ago" },
    { title: "Fee payment received", desc: "$500 from Sarah Johnson", time: "3 hours ago" },
    { title: "Leave request approved", desc: "Teacher Mark Davis - 3 days", time: "5 hours ago" },
  ];

  const upcomingEvents = [
    { title: "Parent-Teacher Meeting", date: "Dec 15", time: "10:00 AM" },
    { title: "Science Fair", date: "Dec 20", time: "9:00 AM" },
    { title: "Winter Break Starts", date: "Dec 23", time: "All Day" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl gradient-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EduManage</span>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.desc}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                    <div className="font-medium mb-2">{event.title}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Events
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Users, label: "Add Student", color: "gradient-primary" },
                { icon: BookOpen, label: "Create Class", color: "bg-success" },
                { icon: FileText, label: "New Exam", color: "bg-accent" },
                { icon: CreditCard, label: "Record Fee", color: "bg-destructive" },
                { icon: Upload, label: "Upload Material", color: "gradient-primary" },
                { icon: Bell, label: "Send Notice", color: "bg-success" },
              ].map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
