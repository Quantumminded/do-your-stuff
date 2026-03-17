-- ============================================
-- FIX COMPLETO DATABASE EROI DI CASA
-- ============================================

-- 1. DISABILITA RLS TEMPORANEAMENTE
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE children DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;

-- 2. CANCELLA E RICREA TABELLA TASKS CON STRUTTURA CORRETTA
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'once')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  coins INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  assigned_to UUID REFERENCES children(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'approved')),
  is_configured BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES parents(id) ON DELETE SET NULL
);

-- 3. INDICI PER PERFORMANCE
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_is_configured ON tasks(is_configured);
CREATE INDEX idx_tasks_family_id ON tasks(assigned_to);

-- 4. RIABILITA RLS CON POLITICHE CORRETTE
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: I genitori possono gestire tutte le task della loro famiglia
CREATE POLICY "Parents can manage tasks" ON tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM parents 
    WHERE parents.id = auth.uid() 
    AND parents.family_id = (
      SELECT family_id FROM children WHERE id = tasks.assigned_to LIMIT 1
    )
  )
);

-- Policy: I bambini possono leggere le loro task
CREATE POLICY "Children can read their tasks" ON tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM children 
    WHERE children.id = auth.uid() 
    AND children.id = tasks.assigned_to
  )
);

-- 5. AGGIUNGI DATI DI TEST SE VUOI
-- INSERT INTO tasks (title, description, recurrence, difficulty, coins, xp, assigned_to, icon, is_configured, created_by) VALUES
-- ('Riempi la lavagna', 'Pulisci la lavagna dopo la scuola', 'daily', 'easy', 10, 5, 'ID_BAMBINO_LEO', '📝', true, 'ID_GENITORE'),
-- ('Metti in ordine i giocattoli', 'Riponi tutti i giocattoli nella scatola', 'daily', 'medium', 15, 10, 'ID_BAMBINO_SOFIA', '🧸', true, 'ID_GENITORE');

-- 6. VERIFICA STRUTTURA
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
