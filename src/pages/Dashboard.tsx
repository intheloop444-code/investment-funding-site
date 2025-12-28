import { useState, useEffect } from 'react';
import { Search, Filter, Download, X, Calendar, Mail, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppointmentBooking from '../components/AppointmentBooking';

interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  cell_phone: string;
  program_type: string;
  process_stage: string;
  lead_source: string;
  status: string;
  loan_term: number;
  state: string;
  property_address: string;
  acquisition_price: number;
  arv: number;
  lead_score: number;
  priority: string;
}

const statusOptions = ['New', 'In Review', 'Contacted', 'Approved', 'Closed'];

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [filters, setFilters] = useState({
    program_type: '',
    process_stage: '',
    lead_source: '',
    status: '',
    loan_term: '',
    state: '',
    priority: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, filters]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(term) ||
          lead.last_name.toLowerCase().includes(term) ||
          lead.email.toLowerCase().includes(term) ||
          lead.cell_phone.includes(term) ||
          (lead.property_address && lead.property_address.toLowerCase().includes(term))
      );
    }

    if (filters.program_type) {
      filtered = filtered.filter((lead) => lead.program_type === filters.program_type);
    }
    if (filters.process_stage) {
      filtered = filtered.filter((lead) => lead.process_stage === filters.process_stage);
    }
    if (filters.lead_source) {
      filtered = filtered.filter((lead) => lead.lead_source === filters.lead_source);
    }
    if (filters.status) {
      filtered = filtered.filter((lead) => lead.status === filters.status);
    }
    if (filters.loan_term) {
      filtered = filtered.filter((lead) => lead.loan_term === parseInt(filters.loan_term));
    }
    if (filters.state) {
      filtered = filtered.filter((lead) => lead.state === filters.state);
    }
    if (filters.priority) {
      filtered = filtered.filter((lead) => lead.priority === filters.priority);
    }

    filtered.sort((a, b) => b.lead_score - a.lead_score);

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)));
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const sendFollowUpEmail = async (lead: Lead) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-follow-up-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: lead.email,
          firstName: lead.first_name,
          lastName: lead.last_name,
          programType: lead.program_type,
          leadId: lead.id,
        }),
      });

      alert(`Follow-up email sent to ${lead.first_name} ${lead.last_name}`);
    } catch (error) {
      console.error('Error sending follow-up email:', error);
      alert('Failed to send email');
    }
  };

  const bookAppointment = (lead: Lead) => {
    setSelectedLead(lead);
    setShowAppointmentModal(true);
  };

  const clearFilters = () => {
    setFilters({
      program_type: '',
      process_stage: '',
      lead_source: '',
      status: '',
      loan_term: '',
      state: '',
      priority: '',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Program Type',
      'Process Stage',
      'Lead Source',
      'Status',
      'Lead Score',
      'Priority',
      'Loan Term',
      'State',
      'Property Address',
      'Acquisition Price',
      'ARV',
      'Date Captured',
    ];

    const rows = filteredLeads.map((lead) => [
      `${lead.first_name} ${lead.last_name}`,
      lead.email,
      lead.cell_phone,
      lead.program_type,
      lead.process_stage,
      lead.lead_source,
      lead.status,
      lead.lead_score || 0,
      lead.priority || 'Medium',
      lead.loan_term || '',
      lead.state || '',
      lead.property_address || '',
      lead.acquisition_price || '',
      lead.arv || '',
      new Date(lead.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management Dashboard</h1>
          <p className="text-gray-600">Manage and track all incoming leads</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or property address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filter Leads</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                  <select
                    value={filters.program_type}
                    onChange={(e) => setFilters({ ...filters, program_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="Bridge (Short Term, No Rehab)">Bridge</option>
                    <option value="Commercial (All)">Commercial</option>
                    <option value="New Construction">New Construction</option>
                    <option value="DSCR/Rental">DSCR/Rental</option>
                    <option value="Fix & Flip">Fix & Flip</option>
                    <option value="New Construction – Multifamily">New Construction – Multifamily</option>
                    <option value="New Construction – Subdivision">New Construction – Subdivision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Process Stage</label>
                  <select
                    value={filters.process_stage}
                    onChange={(e) => setFilters({ ...filters, process_stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="Looking for General Info">Looking for General Info</option>
                    <option value="Actively Looking">Actively Looking</option>
                    <option value="Identified Property">Identified Property</option>
                    <option value="Property Under Contract">Property Under Contract</option>
                    <option value="Own the Property/Land">Own the Property/Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                  <select
                    value={filters.lead_source}
                    onChange={(e) => setFilters({ ...filters, lead_source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term</label>
                  <select
                    value={filters.loan_term}
                    onChange={(e) => setFilters({ ...filters, loan_term: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                    placeholder="Enter state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLeads.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{leads.length}</span> leads
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score / Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No leads found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.cell_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                            <span className="text-sm font-semibold text-gray-900">{lead.lead_score || 0}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(lead.priority)}`}>
                            {lead.priority || 'Medium'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-[200px] truncate">
                          {lead.program_type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-[150px] truncate">
                          {lead.process_stage}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(lead.status)} border-0 focus:ring-2 focus:ring-blue-500`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => bookAppointment(lead)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Book Appointment"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendFollowUpEmail(lead)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Follow-up Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAppointmentModal && selectedLead && (
          <AppointmentBooking
            leadId={selectedLead.id}
            leadName={`${selectedLead.first_name} ${selectedLead.last_name}`}
            onClose={() => {
              setShowAppointmentModal(false);
              setSelectedLead(null);
            }}
            onSuccess={() => {
              setShowAppointmentModal(false);
              setSelectedLead(null);
              alert('Appointment booked successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
}
