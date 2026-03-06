-- Create table for public profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  avatar_url TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_malus_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create table for malus types
CREATE TABLE public.malus_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Microfono aperto", "Caffè versato"
  amount DECIMAL(10,2) NOT NULL, -- 0.50, 1.00, 2.00
  icon TEXT, -- emoji or icon name
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on malus_types
ALTER TABLE public.malus_types ENABLE ROW LEVEL SECURITY;

-- Create table for transactions
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  proposed_by_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  malus_type_id UUID REFERENCES public.malus_types(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'contested', 'cancelled')) DEFAULT 'pending',
  judged_by_user_id UUID REFERENCES public.profiles(id),
  judged_at TIMESTAMP WITH TIME ZONE,
  contested_at TIMESTAMP WITH TIME ZONE,
  contestation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create table for email logs
CREATE TABLE public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  email_type TEXT CHECK (email_type IN ('transaction', 'sponsor_milestone', 'pending_alert', 'contestation', 'judged')),
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: everyone can see everyone (leaderboard), can only update themselves or if admin
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything on profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Malus Types: viewable by all, managed by admin
CREATE POLICY "Malus types are viewable by everyone" ON public.malus_types FOR SELECT USING (true);
CREATE POLICY "Admins manage malus types" ON public.malus_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions:
-- Everyone can see approved ones
-- Users can see their own (as target or proposer or judge)
-- Everyone can see pending ones that they need to judge (not target/proposer)
-- Admin sees all

CREATE POLICY "Approved transactions are public" ON public.transactions
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can see involved transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = target_user_id 
    OR auth.uid() = proposed_by_user_id
    OR auth.uid() = judged_by_user_id
  );

CREATE POLICY "Users see pending from others" ON public.transactions
  FOR SELECT USING (
    status = 'pending' 
    AND auth.uid() != target_user_id 
    AND auth.uid() != proposed_by_user_id
  );

CREATE POLICY "Users can propose a malus" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = proposed_by_user_id);

CREATE POLICY "Others can judge pending" ON public.transactions
  FOR UPDATE USING (
    status = 'pending' 
    AND auth.uid() != target_user_id 
    AND auth.uid() != proposed_by_user_id
  ) WITH CHECK (
    status IN ('approved', 'rejected') 
    AND judged_by_user_id = auth.uid()
  );

CREATE POLICY "Target can contest within 24h" ON public.transactions
  FOR UPDATE USING (
    status = 'approved' 
    AND auth.uid() = target_user_id
    AND contested_at IS NULL
    AND created_at > (now() - interval '24 hours')
  ) WITH CHECK (status = 'contested');

CREATE POLICY "Admin manages all transactions" ON public.transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger: Handle Approved Transactions
CREATE OR REPLACE FUNCTION public.handle_approved_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status = 'pending' OR OLD.status IS NULL) THEN
    -- Update balance and count
    UPDATE public.profiles 
    SET 
      balance = balance + NEW.amount,
      total_malus_received = total_malus_received + 1,
      updated_at = now()
    WHERE id = NEW.target_user_id;
    
    -- Check for milestone email (every 5)
    DECLARE
      current_count INTEGER;
    BEGIN
      SELECT total_malus_received INTO current_count 
      FROM public.profiles 
      WHERE id = NEW.target_user_id;
      
      IF current_count % 5 = 0 THEN
        INSERT INTO public.email_logs (user_id, email_type, metadata)
        VALUES (
          NEW.target_user_id, 
          'sponsor_milestone', 
          jsonb_build_object('malus_count', current_count, 'sponsor_level', current_count / 5)
        );
      END IF;
    END;
  END IF;
  
  -- Rollback balance if cancelled by admin
  IF NEW.status = 'cancelled' AND OLD.status = 'contested' THEN
    UPDATE public.profiles 
    SET 
      balance = balance - NEW.amount,
      total_malus_received = total_malus_received - 1,
      updated_at = now()
    WHERE id = NEW.target_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_approved
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_approved_transaction();
