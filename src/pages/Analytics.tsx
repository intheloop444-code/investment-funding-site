import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalLeads: number;
  leadsByProgramType: Record<string, number>;
  leadsByLoanTerm: Record<string, number>;
  leadsByProcessStage: Record<string, number>;
  leadsBySource: Record<string, number>;
  leadsByState: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsOverTime: { date: string; count: number }[];
  conversionRate: number;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const [filters, setFilters] = useState({
    program_type: '',
    process_stage: '',
    lead_source: '',
    state: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      let query = supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (filters.program_type) {
        query = query.eq('program_type', filters.program_type);
      }
      if (filters.process_stage) {
        query = query.eq('process_stage', filters.process_stage);
      }
      if (filters.lead_source) {
        query = query.eq('lead_source', filters.lead_source);
      }
      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      const { data: leads, error } = await query;

      if (error) throw error;

      const totalLeads = leads?.length || 0;

      const leadsByProgramType: Record<string, number> = {};
      const leadsByLoanTerm: Record<string, number> = {};
      const leadsByProcessStage: Record<string, number> = {};
      const leadsBySource: Record<string, number> = {};
      const leadsByState: Record<string, number> = {};
      const leadsByStatus: Record<string, number> = {};
      const leadsOverTimeMap: Record<string, number> = {};

      leads?.forEach((lead) => {
        leadsByProgramType[lead.program_type] = (leadsByProgramType[lead.program_type] || 0) + 1;
        if (lead.loan_term) {
          leadsByLoanTerm[lead.loan_term] = (leadsByLoanTerm[lead.loan_term] || 0) + 1;
        }
        leadsByProcessStage[lead.process_stage] = (leadsByProcessStage[lead.process_stage] || 0) + 1;
        leadsBySource[lead.lead_source] = (leadsBySource[lead.lead_source] || 0) + 1;
        if (lead.state) {
          leadsByState[lead.state] = (leadsByState[lead.state] || 0) + 1;
        }
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;

        const date = new Date(lead.created_at).toLocaleDateString();
        leadsOverTimeMap[date] = (leadsOverTimeMap[date] || 0) + 1;
      });

      const leadsOverTime = Object.entries(leadsOverTimeMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const closedLeads = leadsByStatus['Closed'] || 0;
      const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

      setAnalytics({
        totalLeads,
        leadsByProgramType,
        leadsByLoanTerm,
        leadsByProcessStage,
        leadsBySource,
        leadsByState,
        leadsByStatus,
        leadsOverTime,
        conversionRate,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;

    const report = {
      'Report Generated': new Date().toLocaleString(),
      'Date Range': `Last ${dateRange} days`,
      'Total Leads': analytics.totalLeads,
      'Conversion Rate': `${analytics.conversionRate.toFixed(2)}%`,
      'Leads by Program Type': analytics.leadsByProgramType,
      'Leads by Loan Term': analytics.leadsByLoanTerm,
      'Leads by Process Stage': analytics.leadsByProcessStage,
      'Leads by Source': analytics.leadsBySource,
      'Leads by State': analytics.leadsByState,
      'Leads by Status': analytics.leadsByStatus,
    };

    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track performance and gain insights</p>
          </div>
          <button
            onClick={exportReport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

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
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Email">Email</option>
                <option value="Client Referral">Client Referral</option>
                <option value="Other">Other</option>
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
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{analytics.totalLeads}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Leads</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</h3>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{analytics.leadsByStatus['Closed'] || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Closed Deals</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {(analytics.totalLeads / parseInt(dateRange)).toFixed(1)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Avg Leads/Day</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads Over Time</h3>
            <div className="space-y-2">
              {analytics.leadsOverTime.length > 0 ? (
                <div className="h-64 flex items-end justify-between gap-2">
                  {analytics.leadsOverTime.map((item, index) => {
                    const maxCount = Math.max(...analytics.leadsOverTime.map((i) => i.count));
                    const height = (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-xs font-semibold text-gray-700 mb-1">{item.count}</div>
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Program Type</h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadsByProgramType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{type}</span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Loan Term</h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadsByLoanTerm)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([term, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={term}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{term} months</span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadsBySource)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([source, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{source}</span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Process Stage</h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadsByProcessStage)
                .sort((a, b) => b[1] - a[1])
                .map(([stage, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={stage}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{stage}</span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
            <div className="space-y-3">
              {Object.entries(analytics.leadsByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const percentage = (count / analytics.totalLeads) * 100;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{status}</span>
                        <span className="text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
