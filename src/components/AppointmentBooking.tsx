import { useState } from 'react';
import { Calendar, Clock, Video, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AppointmentBookingProps {
  leadId: string;
  leadName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentBooking({ leadId, leadName, onClose, onSuccess }: AppointmentBookingProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_at: '',
    duration_minutes: '60',
    appointment_type: 'Initial Consultation',
    notes: '',
  });

  const appointmentTypes = [
    'Initial Consultation',
    'Property Review',
    'Loan Structure Discussion',
    'Document Review',
    'Final Closing Meeting',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meetingLink = `https://meet.example.com/${leadId}-${Date.now()}`;

      const { error } = await supabase.from('appointments').insert([
        {
          lead_id: leadId,
          scheduled_at: formData.scheduled_at,
          duration_minutes: parseInt(formData.duration_minutes),
          appointment_type: formData.appointment_type,
          notes: formData.notes,
          meeting_link: meetingLink,
          status: 'Scheduled',
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Book Appointment</h2>
              <p className="text-blue-100">Schedule a consultation with {leadName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              min={minDateTime}
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Duration <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.appointment_type}
              onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any specific topics you'd like to discuss..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Video className="w-4 h-4 inline mr-2" />
              A video meeting link will be automatically generated and sent to the lead's email.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
