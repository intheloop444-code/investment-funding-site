/*
  # Investment Funding Lead Capture System Database

  1. New Tables
    - `leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `created_at` (timestamptz) - Timestamp when lead was captured
      - `updated_at` (timestamptz) - Timestamp when lead was last updated
      
      Program & Stage Info:
      - `program_type` (text) - Type of loan program
      - `process_stage` (text) - Current stage in the process
      - `lead_source` (text) - How the lead found us
      - `status` (text) - Current lead status (New, In Review, Contacted, Approved, Closed)
      
      Borrower Info:
      - `first_name` (text) - Borrower first name
      - `last_name` (text) - Borrower last name
      - `email` (text) - Primary email address
      - `secondary_email` (text) - Secondary email address
      - `cell_phone` (text) - Cell phone number
      - `co_borrower_name` (text) - Co-borrower full name
      - `co_borrower_email` (text) - Co-borrower email
      - `co_borrower_phone` (text) - Co-borrower phone
      - `address` (text) - Street address
      - `city` (text) - City
      - `state` (text) - State
      - `zip_code` (text) - Zip code
      - `residence_status` (text) - Rent or Own
      
      Personal Info:
      - `citizenship` (text) - Citizenship status
      - `mid_credit_score` (integer) - Mid credit score
      - `credit_score_range` (text) - Credit score range
      
      Entity Info:
      - `entity_name` (text) - Name of entity
      - `entity_type` (text) - Type of entity (LLC, Corp, etc)
      
      Background Checks:
      - `bankruptcy_last_7_years` (boolean) - Bankruptcy in last 7 years
      - `outstanding_judgments` (boolean) - Outstanding judgments
      - `active_lawsuits` (boolean) - Active lawsuits
      - `property_tax_liens` (boolean) - Property tax liens
      - `foreclosure_history` (boolean) - Foreclosure history
      - `delinquencies_defaults` (boolean) - Delinquencies or defaults
      - `felony_fraud_convictions` (boolean) - Felony or fraud convictions
      - `background_explanation` (text) - Explanation for any background issues
      
      Experience:
      - `fix_flip_experience` (integer) - Number of fix & flip projects (last 3 years)
      - `multifamily_experience` (boolean) - Multi-family experience
      - `investment_properties_owned` (integer) - Number of investment properties owned
      - `professional_licenses` (text) - Professional licenses held
      - `liquid_assets` (numeric) - Cash reserves/liquid assets
      
      Loan Settings:
      - `loan_term` (integer) - Loan term in months
      - `transaction_type` (text) - Type of transaction
      - `acquisition_price` (numeric) - Acquisition/purchase price
      - `property_value_as_is` (numeric) - Current property value
      - `desired_closing_date` (date) - Desired closing date
      - `rehab_budget` (numeric) - Rehab/construction budget
      - `rehab_timeline` (text) - Rehab timeline
      
      Property Details:
      - `property_address` (text) - Subject property address
      - `property_zip` (text) - Subject property zip code
      - `location_type` (text) - Urban, Rural, or Suburban
      - `property_type` (text) - Type of property
      - `num_buildings` (integer) - Number of buildings
      - `arv` (numeric) - After repair value
      - `num_units_current` (integer) - Current number of units
      - `num_units_completion` (integer) - Number of units at completion
      - `num_parcels` (integer) - Number of parcels
      - `existing_structure` (boolean) - Existing structure present
      - `gc_licensed` (boolean) - General contractor licensed
      - `gc_insured` (boolean) - General contractor insured
      - `wholesale_fee` (numeric) - Wholesale fee if applicable
      - `seller_financing` (boolean) - Seller financing involved
      
      Terms:
      - `terms_accepted` (boolean) - Terms and conditions accepted
      - `credit_pull_authorized` (boolean) - Credit pull authorized

  2. Security
    - Enable RLS on `leads` table
    - Add policies for authenticated admin access
    
  3. Indexes
    - Add indexes for common search and filter fields
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  program_type text NOT NULL,
  process_stage text NOT NULL,
  lead_source text NOT NULL,
  status text DEFAULT 'New',
  
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  secondary_email text,
  cell_phone text NOT NULL,
  co_borrower_name text,
  co_borrower_email text,
  co_borrower_phone text,
  address text,
  city text,
  state text,
  zip_code text,
  residence_status text,
  
  citizenship text,
  mid_credit_score integer,
  credit_score_range text,
  
  entity_name text,
  entity_type text,
  
  bankruptcy_last_7_years boolean DEFAULT false,
  outstanding_judgments boolean DEFAULT false,
  active_lawsuits boolean DEFAULT false,
  property_tax_liens boolean DEFAULT false,
  foreclosure_history boolean DEFAULT false,
  delinquencies_defaults boolean DEFAULT false,
  felony_fraud_convictions boolean DEFAULT false,
  background_explanation text,
  
  fix_flip_experience integer DEFAULT 0,
  multifamily_experience boolean DEFAULT false,
  investment_properties_owned integer DEFAULT 0,
  professional_licenses text,
  liquid_assets numeric,
  
  loan_term integer,
  transaction_type text,
  acquisition_price numeric,
  property_value_as_is numeric,
  desired_closing_date date,
  rehab_budget numeric,
  rehab_timeline text,
  
  property_address text,
  property_zip text,
  location_type text,
  property_type text,
  num_buildings integer,
  arv numeric,
  num_units_current integer,
  num_units_completion integer,
  num_parcels integer,
  existing_structure boolean,
  gc_licensed boolean,
  gc_insured boolean,
  wholesale_fee numeric,
  seller_financing boolean,
  
  terms_accepted boolean DEFAULT false,
  credit_pull_authorized boolean DEFAULT false
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_program_type ON leads(program_type);
CREATE INDEX IF NOT EXISTS idx_leads_process_stage ON leads(process_stage);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_state ON leads(state);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
