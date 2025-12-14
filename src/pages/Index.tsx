import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Bell,
  CheckCircle,
  ArrowRight,
  Play,
  Shield,
  BarChart3,
  Clock
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for Admin, Teachers, Students, and Parents with tailored features.",
    },
    {
      icon: BookOpen,
      title: "Class Management",
      description: "Organize classes, subjects, and curriculum with intuitive scheduling tools.",
    },
    {
      icon: Calendar,
      title: "Attendance System",
      description: "Track attendance and manage leave requests with automated notifications.",
    },
    {
      icon: BarChart3,
      title: "Exams & Results",
      description: "Create online exams, auto-grade assessments, and publish results instantly.",
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      description: "Generate invoices, track payments, and send automated reminders.",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Keep everyone informed with Email and SMS notifications for important updates.",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Students Managed" },
    { value: "500+", label: "Institutions" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduManage</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Trusted by 500+ Educational Institutions
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Modern School
              <span className="text- block">Management System</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Streamline your institution's operations with our comprehensive platform. 
              Manage students, teachers, attendance, exams, and fees—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 gradient-primary opacity-10 rounded-3xl blur-xl" />
            <div className="relative bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-accent/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 text-center text-sm text-muted-foreground">EduManage Dashboard</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-background to-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Students", value: "2,456", change: "+12%", icon: Users },
                    { label: "Attendance Rate", value: "94.5%", change: "+2.3%", icon: CheckCircle },
                    { label: "Active Courses", value: "48", change: "+5", icon: BookOpen },
                  ].map((stat, index) => (
                    <div key={index} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <stat.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-success text-sm font-medium">{stat.change}</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-muted-foreground text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive tools to manage every aspect of your educational institution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Choose EduManage?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Built by educators, for educators. We understand the challenges of managing an educational institution and have designed our platform to address them all.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security with 99.9% uptime guarantee." },
                  { icon: Clock, title: "Save Time", desc: "Automate repetitive tasks and focus on what matters most." },
                  { icon: BarChart3, title: "Data-Driven Insights", desc: "Make informed decisions with comprehensive analytics." },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 gradient-accent opacity-10 rounded-3xl blur-2xl" />
              <div className="relative bg-card p-8 rounded-3xl border border-border shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                    <span className="text-xl font-bold text-accent-foreground">98</span>
                  </div>
                  <div>
                    <div className="font-semibold">Customer Satisfaction</div>
                    <div className="text-sm text-muted-foreground">Based on 500+ reviews</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {["Easy to use interface", "Excellent customer support", "Regular feature updates", "Great value for money"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative gradient-hero rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Institution?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of schools and tuition centers already using EduManage to streamline their operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button variant="accent" size="xl">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="heroOutline" size="xl">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">EduManage</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} EduManage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
