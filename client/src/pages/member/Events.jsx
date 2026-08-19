import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle2 } from 'lucide-react';
import { communityAPI } from '../../api/allAPIs';
import toast from 'react-hot-toast';

const MemberEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await communityAPI.getEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRSVP = async (event) => {
    try {
      await communityAPI.registerEvent(event._id, 2);
      toast.success(event.isRegistered ? 'RSVP cancelled' : 'RSVP registered for 2 attendees!', { icon: '🎉' });
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update RSVP');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Society Events & RSVPs</h2>
        <p className="text-xs sm:text-sm text-slate-500">Festivals, sports events, and annual general meetings (AGM)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <div key={e._id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              {e.coverImage && (
                <div className="h-44 w-full overflow-hidden relative">
                  <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1">
                    <Calendar size={13} /> {new Date(e.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              )}

              <div className="p-5">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1.5">{e.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{e.description}</p>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-slate-400" />
                    <span>{e.startTime} - {e.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{e.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500">
                <Users size={13} className="inline mr-1 text-brand-600" />
                {e.totalRegisteredAttendees || 0} Attending
              </span>
              <button
                onClick={() => handleToggleRSVP(e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  e.isRegistered
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/25'
                }`}
              >
                {e.isRegistered ? '✓ RSVP Confirmed' : 'RSVP Attend'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberEvents;
