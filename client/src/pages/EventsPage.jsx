import React, { useState, useEffect } from 'react';
import { getEvents } from '../api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import Skeleton from '../components/Skeleton';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [plannedEvents, setPlannedEvents] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    loadEvents();
    loadPlannedEvents();
  }, []);

  const loadPlannedEvents = () => {
    const saved = localStorage.getItem(`planned_events_${user?.id}`);
    if (saved) {
      setPlannedEvents(JSON.parse(saved));
    }
  };

  const addToPlan = (event) => {
    if (!plannedEvents.find(e => e._id === event._id)) {
      const newPlan = [...plannedEvents, event];
      setPlannedEvents(newPlan);
      localStorage.setItem(`planned_events_${user?.id}`, JSON.stringify(newPlan));
      setAddedId(event._id);
      showToast.success(`✓ ${event.title} added to My Plan!`);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  const removeFromPlan = (event) => {
    const newPlan = plannedEvents.filter(e => e._id !== event._id);
    setPlannedEvents(newPlan);
    localStorage.setItem(`planned_events_${user?.id}`, JSON.stringify(newPlan));
    showToast.info(`Removed from My Plan`);
  };

  const togglePlanStatus = (event) => {
    if (plannedEvents.find(e => e._id === event._id)) {
      removeFromPlan(event);
    } else {
      addToPlan(event);
    }
  };

  const isPlanned = (eventId) => plannedEvents.some(e => e._id === eventId);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data.data || []);
    } catch (error) {
      showToast.error('Failed to load events');
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || event.tag === filter;
    return matchesSearch && matchesFilter;
  });

  const tags = [...new Set(events.map(e => e.tag))];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ margin: '0 0 20px', animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>All Events</h1>
          
          {/* Search */}
          <div style={{ marginBottom: '16px', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            <input
              type="text"
              className="input"
              placeholder="🔍 Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
            <button
              className={`btn ${filter === 'all' ? '' : 'ghost'}`}
              onClick={() => setFilter('all')}
              style={{ transition: 'all 0.3s ease' }}
            >
              All
            </button>
            {tags.map((tag, index) => (
              <button
                key={tag}
                className={`btn ${filter === tag ? '' : 'ghost'}`}
                onClick={() => {
                  setFilter(tag);
                  showToast.info(`Filtering by ${tag}`);
                }}
                style={{ 
                  transition: 'all 0.3s ease',
                  animation: `slideInRight 0.5s ease-out ${0.4 + index * 0.05}s both`
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {loading ? (
          <Skeleton count={4} height="180px" />
        ) : filteredEvents.length === 0 ? (
          <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#adb6d9' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              No events found
            </div>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div 
              key={event._id} 
              className="card"
              style={{ 
                animation: `fadeInUp 0.6s ease-out ${0.1 + index * 0.05}s both`,
                transform: hoveredId === event._id ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={() => setHoveredId(event._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px', 
                      fontSize: '20px',
                      transition: 'color 0.3s ease',
                      color: hoveredId === event._id ? '#7c9cff' : '#eaf0ff'
                    }}>
                      {event.title}
                    </h3>
                    <div style={{ color: '#adb6d9', fontSize: '14px', transition: 'color 0.3s ease' }}>
                      🕒 {event.time} · 📍 {event.venue}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: '180px' }}>
                    <span className="pill" style={{ fontSize: '14px', animation: 'fadeInScale 0.4s ease-out' }}>
                      +{event.points} XP
                    </span>
                    <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff', fontSize: '14px', animation: 'fadeInScale 0.4s ease-out 0.1s both' }}>
                      {event.tag}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#adb6d9', margin: '12px 0', lineHeight: '1.6' }}>
                  {event.desc}
                </p>
                <button 
                  className={isPlanned(event._id) ? "btn" : "btn ghost"}
                  onClick={() => togglePlanStatus(event)}
                  style={{
                    background: isPlanned(event._id) ? '#6af2c6' : 'transparent',
                    color: isPlanned(event._id) ? '#0a0e27' : '#6af2c6',
                    border: `1px solid #6af2c6`,
                    transition: 'all 0.3s ease',
                    transform: addedId === event._id ? 'scale(1.05)' : 'scale(1)',
                    fontWeight: isPlanned(event._id) ? '700' : '600'
                  }}
                  title={isPlanned(event._id) ? 'Remove from plan' : 'Add to plan'}
                >
                  {isPlanned(event._id) ? '✓ In My Plan' : '+ Add to Plan'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
