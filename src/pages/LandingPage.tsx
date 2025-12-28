import { useState, FormEvent } from 'react';
import { CheckCircle, TrendingUp, Clock, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  program_type: string;
  process_stage: string;
  lead_source: string;
  first_name: string;
  last_name: string;
  email: string;
  secondary_email: string;
  cell_phone: string;
  co_borrower_name: string;
  co_borrower_email: string;
  co_borrower_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  residence_status: string;
  citizenship: string;
  mid_credit_score: string;
  credit_score_range: string;
  entity_name: string;
  entity_type: string;
  bankruptcy_last_7_years: boolean;
  outstanding_judgments: boolean;
  active_lawsuits: boolean;
  property_tax_liens: boolean;
  foreclosure_history: boolean;
  delinquencies_defaults: boolean;
  felony_fraud_convictions: boolean;
  background_explanation: string;
  fix_flip_experience: string;
  multifamily_experience: boolean;
  investment_properties_owned: string;
  professional_licenses: string;
  liquid_assets: string;
  loan_term: string;
  transaction_type: string;
  acquisition_price: string;
  property_value_as_is: string;
  desired_closing_date: string;
  rehab_budget: string;
  rehab_timeline: string;
  property_address: string;
  property_zip: string;
  location_type: string;
  property_type: string;
  num_buildings: string;
  arv: string;
  num_units_current: string;
  num_units_completion: string;
  num_parcels: string;
  existing_structure: boolean;
  gc_licensed: boolean;
  gc_insured: boolean;
  wholesale_fee: string;
  seller_financing: boolean;
  terms_accepted: boolean;
  credit_pull_authorized: boolean;
}

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    program_type: '',
    process_stage: '',
    lead_source: '',
    first_name: '',
    last_name: '',
    email: '',
    secondary_email: '',
    cell_phone: '',
    co_borrower_name: '',
    co_borrower_email: '',
    co_borrower_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    residence_status: '',
    citizenship: '',
    mid_credit_score: '',
    credit_score_range: '',
    entity_name: '',
    entity_type: '',
    bankruptcy_last_7_years: false,
    outstanding_judgments: false,
    active_lawsuits: false,
    property_tax_liens: false,
    foreclosure_history: false,
    delinquencies_defaults: false,
    felony_fraud_convictions: false,
    background_explanation: '',
    fix_flip_experience: '',
    multifamily_experience: false,
    investment_properties_owned: '',
    professional_licenses: '',
    liquid_assets: '',
    loan_term: '',
    transaction_type: '',
    acquisition_price: '',
    property_value_as_is: '',
    desired_closing_date: '',
    rehab_budget: '',
    rehab_timeline: '',
    property_address: '',
    property_zip: '',
    location_type: '',
    property_type: '',
    num_buildings: '',
    arv: '',
    num_units_current: '',
    num_units_completion: '',
    num_parcels: '',
    existing_structure: false,
    gc_licensed: false,
    gc_insured: false,
    wholesale_fee: '',
    seller_financing: false,
    terms_accepted: false,
    credit_pull_authorized: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.terms_accepted) {
      setError('Please accept the terms and conditions');
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        mid_credit_score: formData.mid_credit_score ? parseInt(formData.mid_credit_score) : null,
        fix_flip_experience: formData.fix_flip_experience ? parseInt(formData.fix_flip_experience) : 0,
        investment_properties_owned: formData.investment_properties_owned ? parseInt(formData.investment_properties_owned) : 0,
        liquid_assets: formData.liquid_assets ? parseFloat(formData.liquid_assets) : null,
        loan_term: formData.loan_term ? parseInt(formData.loan_term) : null,
        acquisition_price: formData.acquisition_price ? parseFloat(formData.acquisition_price) : null,
        property_value_as_is: formData.property_value_as_is ? parseFloat(formData.property_value_as_is) : null,
        rehab_budget: formData.rehab_budget ? parseFloat(formData.rehab_budget) : null,
        num_buildings: formData.num_buildings ? parseInt(formData.num_buildings) : null,
        arv: formData.arv ? parseFloat(formData.arv) : null,
        num_units_current: formData.num_units_current ? parseInt(formData.num_units_current) : null,
        num_units_completion: formData.num_units_completion ? parseInt(formData.num_units_completion) : null,
        num_parcels: formData.num_parcels ? parseInt(formData.num_parcels) : null,
        wholesale_fee: formData.wholesale_fee ? parseFloat(formData.wholesale_fee) : null,
      };

      const { data: insertedLead, error: insertError } = await supabase
        .from('leads')
        .insert([submitData])
        .select()
        .single();

      if (insertError) throw insertError;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.first_name,
            lastName: formData.last_name,
            programType: formData.program_type,
            leadId: insertedLead?.id,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. We'll review your application and get back to you within 24-48 hours.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Investment Funding Made Simple
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're an investor or borrower, quickly apply for multiple loan types and get pre-approved fast.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Pre-Approval</h3>
            <p className="text-sm text-gray-600">Get pre-approved in as little as 24 hours</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Loan Types</h3>
            <p className="text-sm text-gray-600">Bridge, DSCR, Fix & Flip, and more</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Guidance</h3>
            <p className="text-sm text-gray-600">Expert support throughout the process</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Proven Track Record</h3>
            <p className="text-sm text-gray-600">Thousands of successful closings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Start Your Application</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Program Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.program_type}
                    onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Program Type</option>
                    <option value="Bridge (Short Term, No Rehab)">Bridge (Short Term, No Rehab)</option>
                    <option value="Commercial (All)">Commercial (All)</option>
                    <option value="New Construction">New Construction</option>
                    <option value="DSCR/Rental">DSCR/Rental</option>
                    <option value="Fix & Flip">Fix & Flip</option>
                    <option value="New Construction – Multifamily">New Construction – Multifamily</option>
                    <option value="New Construction – Subdivision">New Construction – Subdivision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Process Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.process_stage}
                    onChange={(e) => setFormData({ ...formData, process_stage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Process Stage</option>
                    <option value="Looking for General Info">Looking for General Info</option>
                    <option value="Actively Looking">Actively Looking</option>
                    <option value="Identified Property">Identified Property</option>
                    <option value="Property Under Contract">Property Under Contract</option>
                    <option value="Own the Property/Land">Own the Property/Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.lead_source}
                    onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">How did you hear about us?</option>
                    <option value="LNH Rep">LNH Rep</option>
                    <option value="Email">Email</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Text">Text</option>
                    <option value="Repeat Client">Repeat Client</option>
                    <option value="Craigslist">Craigslist</option>
                    <option value="Client Referral">Client Referral</option>
                    <option value="Meetup/REI">Meetup/REI</option>
                    <option value="Yelp">Yelp</option>
                    <option value="Bigger Pockets">Bigger Pockets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Borrower Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Email
                  </label>
                  <input
                    type="email"
                    value={formData.secondary_email}
                    onChange={(e) => setFormData({ ...formData, secondary_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cell Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.cell_phone}
                    onChange={(e) => setFormData({ ...formData, cell_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Co-Borrower Name
                  </label>
                  <input
                    type="text"
                    value={formData.co_borrower_name}
                    onChange={(e) => setFormData({ ...formData, co_borrower_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Co-Borrower Email
                  </label>
                  <input
                    type="email"
                    value={formData.co_borrower_email}
                    onChange={(e) => setFormData({ ...formData, co_borrower_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Co-Borrower Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.co_borrower_phone}
                    onChange={(e) => setFormData({ ...formData, co_borrower_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residence Status
                  </label>
                  <select
                    value={formData.residence_status}
                    onChange={(e) => setFormData({ ...formData, residence_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Rent">Rent</option>
                    <option value="Own">Own</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship
                  </label>
                  <select
                    value={formData.citizenship}
                    onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Citizenship</option>
                    <option value="U.S. Citizen">U.S. Citizen</option>
                    <option value="Permanent Resident">Permanent Resident</option>
                    <option value="Non-Permanent Resident">Non-Permanent Resident</option>
                    <option value="Foreign National">Foreign National</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mid Credit Score
                  </label>
                  <input
                    type="number"
                    value={formData.mid_credit_score}
                    onChange={(e) => setFormData({ ...formData, mid_credit_score: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Score Range
                  </label>
                  <select
                    value={formData.credit_score_range}
                    onChange={(e) => setFormData({ ...formData, credit_score_range: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Range</option>
                    <option value="300-579">300-579 (Poor)</option>
                    <option value="580-669">580-669 (Fair)</option>
                    <option value="670-739">670-739 (Good)</option>
                    <option value="740-799">740-799 (Very Good)</option>
                    <option value="800-850">800-850 (Excellent)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Entity Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Name
                  </label>
                  <input
                    type="text"
                    value={formData.entity_name}
                    onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Type
                  </label>
                  <select
                    value={formData.entity_type}
                    onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Entity Type</option>
                    <option value="LLC">LLC</option>
                    <option value="Corp">Corp</option>
                    <option value="S-Corp">S-Corp</option>
                    <option value="General Partnership">General Partnership</option>
                    <option value="Limited Partnership">Limited Partnership</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Background Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bankruptcy"
                    checked={formData.bankruptcy_last_7_years}
                    onChange={(e) => setFormData({ ...formData, bankruptcy_last_7_years: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="bankruptcy" className="ml-3 text-sm text-gray-700">
                    Bankruptcy in last 7 years
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="judgments"
                    checked={formData.outstanding_judgments}
                    onChange={(e) => setFormData({ ...formData, outstanding_judgments: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="judgments" className="ml-3 text-sm text-gray-700">
                    Outstanding Judgments
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lawsuits"
                    checked={formData.active_lawsuits}
                    onChange={(e) => setFormData({ ...formData, active_lawsuits: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="lawsuits" className="ml-3 text-sm text-gray-700">
                    Active Lawsuits
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="liens"
                    checked={formData.property_tax_liens}
                    onChange={(e) => setFormData({ ...formData, property_tax_liens: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="liens" className="ml-3 text-sm text-gray-700">
                    Property Tax Liens
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="foreclosure"
                    checked={formData.foreclosure_history}
                    onChange={(e) => setFormData({ ...formData, foreclosure_history: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="foreclosure" className="ml-3 text-sm text-gray-700">
                    Foreclosure History
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="delinquencies"
                    checked={formData.delinquencies_defaults}
                    onChange={(e) => setFormData({ ...formData, delinquencies_defaults: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="delinquencies" className="ml-3 text-sm text-gray-700">
                    Delinquencies or Defaults
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="felony"
                    checked={formData.felony_fraud_convictions}
                    onChange={(e) => setFormData({ ...formData, felony_fraud_convictions: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="felony" className="ml-3 text-sm text-gray-700">
                    Felony or Fraud Convictions
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Explanation (if any boxes checked above)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.background_explanation}
                    onChange={(e) => setFormData({ ...formData, background_explanation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Borrower Experience</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fix & Flip Experience (last 3 years)
                  </label>
                  <input
                    type="number"
                    value={formData.fix_flip_experience}
                    onChange={(e) => setFormData({ ...formData, fix_flip_experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of projects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Properties Owned
                  </label>
                  <input
                    type="number"
                    value={formData.investment_properties_owned}
                    onChange={(e) => setFormData({ ...formData, investment_properties_owned: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Number of properties"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="multifamily"
                    checked={formData.multifamily_experience}
                    onChange={(e) => setFormData({ ...formData, multifamily_experience: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="multifamily" className="ml-3 text-sm text-gray-700">
                    Multi-family Experience
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Licenses
                  </label>
                  <input
                    type="text"
                    value={formData.professional_licenses}
                    onChange={(e) => setFormData({ ...formData, professional_licenses: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liquid Assets / Cash Reserves ($)
                  </label>
                  <input
                    type="number"
                    value={formData.liquid_assets}
                    onChange={(e) => setFormData({ ...formData, liquid_assets: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Loan Settings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (months)
                  </label>
                  <select
                    value={formData.loan_term}
                    onChange={(e) => setFormData({ ...formData, loan_term: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Term</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Transaction Type</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rate & Term Refinance">Rate & Term Refinance</option>
                    <option value="Cash-Out">Cash-Out</option>
                    <option value="Delayed Purchase">Delayed Purchase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acquisition/Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.acquisition_price}
                    onChange={(e) => setFormData({ ...formData, acquisition_price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Value (As-Is) ($)
                  </label>
                  <input
                    type="number"
                    value={formData.property_value_as_is}
                    onChange={(e) => setFormData({ ...formData, property_value_as_is: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Closing Date
                  </label>
                  <input
                    type="date"
                    value={formData.desired_closing_date}
                    onChange={(e) => setFormData({ ...formData, desired_closing_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rehab/Construction Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.rehab_budget}
                    onChange={(e) => setFormData({ ...formData, rehab_budget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rehab Timeline
                  </label>
                  <input
                    type="text"
                    value={formData.rehab_timeline}
                    onChange={(e) => setFormData({ ...formData, rehab_timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 6 months"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Subject Property Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={formData.property_address}
                    onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.property_zip}
                    onChange={(e) => setFormData({ ...formData, property_zip: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Location Type</option>
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                    <option value="Suburban">Suburban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <input
                    type="text"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Single Family, Multi-family, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Buildings
                  </label>
                  <input
                    type="number"
                    value={formData.num_buildings}
                    onChange={(e) => setFormData({ ...formData, num_buildings: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ARV (After Repair Value) ($)
                  </label>
                  <input
                    type="number"
                    value={formData.arv}
                    onChange={(e) => setFormData({ ...formData, arv: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Units (Current)
                  </label>
                  <input
                    type="number"
                    value={formData.num_units_current}
                    onChange={(e) => setFormData({ ...formData, num_units_current: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Units (At Completion)
                  </label>
                  <input
                    type="number"
                    value={formData.num_units_completion}
                    onChange={(e) => setFormData({ ...formData, num_units_completion: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Parcels
                  </label>
                  <input
                    type="number"
                    value={formData.num_parcels}
                    onChange={(e) => setFormData({ ...formData, num_parcels: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wholesale Fee ($)
                  </label>
                  <input
                    type="number"
                    value={formData.wholesale_fee}
                    onChange={(e) => setFormData({ ...formData, wholesale_fee: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="existing_structure"
                    checked={formData.existing_structure}
                    onChange={(e) => setFormData({ ...formData, existing_structure: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="existing_structure" className="ml-3 text-sm text-gray-700">
                    Existing Structure
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gc_licensed"
                    checked={formData.gc_licensed}
                    onChange={(e) => setFormData({ ...formData, gc_licensed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="gc_licensed" className="ml-3 text-sm text-gray-700">
                    GC Licensed
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gc_insured"
                    checked={formData.gc_insured}
                    onChange={(e) => setFormData({ ...formData, gc_insured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="gc_insured" className="ml-3 text-sm text-gray-700">
                    GC Insured
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="seller_financing"
                    checked={formData.seller_financing}
                    onChange={(e) => setFormData({ ...formData, seller_financing: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="seller_financing" className="ml-3 text-sm text-gray-700">
                    Seller Financing
                  </label>
                </div>
              </div>
            </div>

            <div className="pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Terms & Conditions</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.terms_accepted}
                    onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    <span className="text-red-500">*</span> I acknowledge that all information provided is accurate and complete to the best of my knowledge, and I authorize a credit pull for loan qualification purposes.
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="credit_auth"
                    checked={formData.credit_pull_authorized}
                    onChange={(e) => setFormData({ ...formData, credit_pull_authorized: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="credit_auth" className="ml-3 text-sm text-gray-700">
                    I authorize a credit pull for loan qualification purposes
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'Get Started - Apply Now'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Client Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-gray-700 mb-4 italic">
                "The team made our first fix and flip possible. Fast approval and excellent guidance throughout the process."
              </p>
              <p className="font-semibold text-gray-900">Sarah M.</p>
              <p className="text-sm text-gray-600">Fix & Flip Investor</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-gray-700 mb-4 italic">
                "Closed our multi-family acquisition in record time. Their expertise in commercial lending is unmatched."
              </p>
              <p className="font-semibold text-gray-900">James T.</p>
              <p className="text-sm text-gray-600">Commercial Developer</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-6">
              <p className="text-gray-700 mb-4 italic">
                "Professional service from start to finish. They worked with us to structure the perfect DSCR loan."
              </p>
              <p className="font-semibold text-gray-900">Maria & Carlos R.</p>
              <p className="text-sm text-gray-600">Rental Property Investors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
