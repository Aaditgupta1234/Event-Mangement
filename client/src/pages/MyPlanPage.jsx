import React, { useState, useEffect } from 'react';
import { getEvents } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyPlanPage() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [plannedEvents, setPlannedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  // Load planned events whenever the page is viewed or user changes
  useEffect(() => {
    loadPlannedEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setAllEvents(response.data.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlannedEvents = () => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`planned_events_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlannedEvents(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Error parsing planned events:', e);
        setPlannedEvents([]);
      }
    } else {
      setPlannedEvents([]);
    }
  };

  const addToPlan = (event) => {
    if (!plannedEvents.find(e => (e._id || e) === event._id)) {
      const newPlan = [...plannedEvents, event];
      setPlannedEvents(newPlan);
      localStorage.setItem(`planned_events_${user?.id}`, JSON.stringify(newPlan));
    }
  };

  const removeFromPlan = (eventId) => {
    const newPlan = plannedEvents.filter(e => (e._id || e) !== eventId);
    setPlannedEvents(newPlan);
    localStorage.setItem(`planned_events_${user?.id}`, JSON.stringify(newPlan));
  };

  const isPlanned = (eventId) => plannedEvents.some(e => (e._id || e) === eventId);

  const myEvents = plannedEvents
    .map(e => (typeof e === 'object' ? e : allEvents.find(ae => ae._id === e)))
    .filter(Boolean);
  const availableEvents = allEvents.filter(event => !isPlanned(event._id));

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* My Plan Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ margin: '0 0 12px' }}>📅 My Event Plan</h1>
          <p style={{ color: '#adb6d9', margin: 0 }}>
            {myEvents.length} events in your plan · {myEvents.reduce((sum, e) => sum + e.points, 0)} total XP
          </p>
        </div>
      </div>

      {/* Planned Events */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Your Planned Events</h2>
        {myEvents.length === 0 ? (
          <div className="card">
            <div style={{ padding: '40px', textAlign: 'center', color: '#adb6d9' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p>No events in your plan yet</p>
              <p style={{ fontSize: '14px' }}>Add events from the available list below</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {myEvents.map((event) => (
              <div key={event._id} className="card">
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px' }}>{event.title}</h3>
                    <div style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '8px' }}>
                      🕒 {event.time} · 📍 {event.venue}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="pill">+{event.points} XP</span>
                      <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff' }}>
                        {event.tag}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ background: '#ff5d6c' }}
                    onClick={() => removeFromPlan(event._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Events */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>Available Events</h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {availableEvents.map((event) => (
            <div key={event._id} className="card">
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px' }}>{event.title}</h3>
                  <p style={{ color: '#adb6d9', margin: '0 0 8px', fontSize: '14px' }}>{event.desc}</p>
                  <div style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '8px' }}>
                    🕒 {event.time} · 📍 {event.venue}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="pill">+{event.points} XP</span>
                    <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff' }}>
                      {event.tag}
                    </span>
                  </div>
                </div>
                <button
                  className="btn"
                  onClick={() => addToPlan(event)}
                >
                  + Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
