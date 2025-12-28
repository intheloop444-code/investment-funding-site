/*
  # Enhanced Lead Management System
  
  1. Lead Scoring Enhancement
    - Add `lead_score` column to leads table (calculated score 0-100)
    - Add `last_contacted` timestamp to track follow-ups
    - Add `next_follow_up` timestamp for scheduled follow-ups
    - Add `priority` field (High, Medium, Low)
    
  2. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `scheduled_at` (timestamptz) - Appointment date/time
      - `duration_minutes` (integer) - Appointment duration
      - `appointment_type` (text) - Consultation, Property Review, etc.
      - `status` (text) - Scheduled, Completed, Cancelled, No-Show
      - `notes` (text) - Additional notes
      - `meeting_link` (text) - Video call link if applicable
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `email_logs`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `email_type` (text) - welcome, follow_up, reminder, nurture
      - `sent_at` (timestamptz)
      - `subject` (text)
      - `status` (text) - sent, failed, pending
      - `created_at` (timestamptz)
    
    - `crm_sync_log`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `crm_system` (text) - Name of CRM (Salesforce, HubSpot, etc.)
      - `sync_status` (text) - success, failed, pending
      - `crm_record_id` (text) - ID in the external CRM
      - `sync_data` (jsonb) - Data that was synced
      - `error_message` (text) - Error if sync failed
      - `synced_at` (timestamptz)
      - `created_at` (timestamptz)
  
  3. Functions
    - Create function to calculate lead score automatically
    - Create trigger to update lead score on insert/update
  
  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated access
  
  5. Indexes
    - Add indexes for performance on foreign keys and common queries
*/

-- Add new columns to leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lead_score'
  ) THEN
    ALTER TABLE leads ADD COLUMN lead_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'priority'
  ) THEN
    ALTER TABLE leads ADD COLUMN priority text DEFAULT 'Medium';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_contacted'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_contacted timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_follow_up'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_follow_up timestamptz;
  END IF;
END $$;

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  appointment_type text NOT NULL,
  status text DEFAULT 'Scheduled',
  notes text,
  meeting_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  subject text NOT NULL,
  status text DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert email logs"
  ON email_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Create crm_sync_log table
CREATE TABLE IF NOT EXISTS crm_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  crm_system text NOT NULL,
  sync_status text DEFAULT 'pending',
  crm_record_id text,
  sync_data jsonb,
  error_message text,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crm_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all CRM sync logs"
  ON crm_sync_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert CRM sync logs"
  ON crm_sync_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update CRM sync logs"
  ON crm_sync_log
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_crm_sync_log_lead_id ON crm_sync_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_log_sync_status ON crm_sync_log(sync_status);

-- Create function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS integer AS $$
DECLARE
  score integer := 0;
BEGIN
  -- Base score for completing application
  score := score + 10;
  
  -- Process stage scoring (max 20 points)
  CASE lead_row.process_stage
    WHEN 'Own the Property/Land' THEN score := score + 20;
    WHEN 'Property Under Contract' THEN score := score + 18;
    WHEN 'Identified Property' THEN score := score + 15;
    WHEN 'Actively Looking' THEN score := score + 10;
    WHEN 'Looking for General Info' THEN score := score + 5;
    ELSE score := score + 0;
  END CASE;
  
  -- Program type scoring (max 15 points) - some programs are higher value
  CASE lead_row.program_type
    WHEN 'Commercial (All)' THEN score := score + 15;
    WHEN 'New Construction – Multifamily' THEN score := score + 15;
    WHEN 'New Construction – Subdivision' THEN score := score + 14;
    WHEN 'Fix & Flip' THEN score := score + 12;
    WHEN 'New Construction' THEN score := score + 12;
    WHEN 'DSCR/Rental' THEN score := score + 10;
    WHEN 'Bridge (Short Term, No Rehab)' THEN score := score + 8;
    ELSE score := score + 5;
  END CASE;
  
  -- Property value scoring (max 20 points)
  IF lead_row.property_value_as_is IS NOT NULL THEN
    IF lead_row.property_value_as_is >= 1000000 THEN
      score := score + 20;
    ELSIF lead_row.property_value_as_is >= 500000 THEN
      score := score + 15;
    ELSIF lead_row.property_value_as_is >= 250000 THEN
      score := score + 10;
    ELSE
      score := score + 5;
    END IF;
  END IF;
  
  -- Experience scoring (max 15 points)
  IF lead_row.fix_flip_experience > 10 THEN
    score := score + 10;
  ELSIF lead_row.fix_flip_experience > 5 THEN
    score := score + 7;
  ELSIF lead_row.fix_flip_experience > 0 THEN
    score := score + 4;
  END IF;
  
  IF lead_row.multifamily_experience THEN
    score := score + 3;
  END IF;
  
  IF lead_row.investment_properties_owned > 0 THEN
    score := score + 2;
  END IF;
  
  -- Liquid assets scoring (max 10 points)
  IF lead_row.liquid_assets IS NOT NULL THEN
    IF lead_row.liquid_assets >= 500000 THEN
      score := score + 10;
    ELSIF lead_row.liquid_assets >= 250000 THEN
      score := score + 7;
    ELSIF lead_row.liquid_assets >= 100000 THEN
      score := score + 5;
    ELSE
      score := score + 2;
    END IF;
  END IF;
  
  -- Credit score bonus (max 10 points)
  IF lead_row.mid_credit_score IS NOT NULL THEN
    IF lead_row.mid_credit_score >= 740 THEN
      score := score + 10;
    ELSIF lead_row.mid_credit_score >= 670 THEN
      score := score + 7;
    ELSIF lead_row.mid_credit_score >= 620 THEN
      score := score + 4;
    ELSE
      score := score + 2;
    END IF;
  END IF;
  
  -- Deduct points for background issues (max -10 points)
  IF lead_row.bankruptcy_last_7_years THEN score := score - 3; END IF;
  IF lead_row.foreclosure_history THEN score := score - 3; END IF;
  IF lead_row.felony_fraud_convictions THEN score := score - 4; END IF;
  
  -- Ensure score is between 0 and 100
  IF score > 100 THEN score := 100; END IF;
  IF score < 0 THEN score := 0; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-calculate lead score
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lead_score := calculate_lead_score(NEW);
  
  -- Set priority based on score
  IF NEW.lead_score >= 75 THEN
    NEW.priority := 'High';
  ELSIF NEW.lead_score >= 50 THEN
    NEW.priority := 'Medium';
  ELSE
    NEW.priority := 'Low';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate score on insert/update
DROP TRIGGER IF EXISTS calculate_lead_score_trigger ON leads;
CREATE TRIGGER calculate_lead_score_trigger
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score();

-- Update existing leads with scores
UPDATE leads SET updated_at = now() WHERE lead_score = 0;
