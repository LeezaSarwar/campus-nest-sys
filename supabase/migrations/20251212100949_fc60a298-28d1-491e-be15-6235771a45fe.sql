
-- Create attendance table
CREATE TABLE public.attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, date)
);

-- Create leaves table
CREATE TABLE public.leaves (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Anyone can view attendance" ON public.attendance
FOR SELECT USING (true);

CREATE POLICY "Teachers can manage attendance" ON public.attendance
FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update attendance" ON public.attendance
FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete attendance" ON public.attendance
FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- Leaves policies
CREATE POLICY "Anyone can view leaves" ON public.leaves
FOR SELECT USING (true);

CREATE POLICY "Students can request leaves" ON public.leaves
FOR INSERT WITH CHECK (auth.uid() = student_id OR has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage leaves" ON public.leaves
FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete leaves" ON public.leaves
FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
