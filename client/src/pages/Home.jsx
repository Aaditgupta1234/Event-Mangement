import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../api';
import { showToast } from '../utils/toast';
import Skeleton from '../components/Skeleton';

export default function Home() {
  const { user, isAdmin, isHost } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [plannedCount, setPlannedCount] = useState(0);
  const [displayXP, setDisplayXP] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    loadPlannedCount();
  }, [user]);

  // Animate XP counter
  useEffect(() => {
    const currentXP = user?.xp || 0;
    const increment = currentXP / 20;
    let count = 0;
    const timer = setInterval(() => {
      count += increment;
      if (count >= currentXP) {
        setDisplayXP(currentXP);
        clearInterval(timer);
      } else {
        setDisplayXP(Math.floor(count));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [user?.xp]);

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

  const loadPlannedCount = () => {
    if (user?.id) {
      const planned = JSON.parse(localStorage.getItem(`planned_events_${user.id}`) || '[]');
      setPlannedCount(planned.length);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTopEvents = () => {
    return events.slice(0, 3);
  };

  const handleAddToMyPlan = (event) => {
    if (user?.id) {
      const planned = JSON.parse(localStorage.getItem(`planned_events_${user.id}`) || '[]');
      if (!planned.find(e => e._id === event._id)) {
        planned.push(event);
        localStorage.setItem(`planned_events_${user.id}`, JSON.stringify(planned));
        setPlannedCount(planned.length);
        showToast.success(`✓ ${event.title} added to My Plan!`);
      } else {
        showToast.info('This event is already in your plan!');
      }
    }
  };

  const handleResetDemo = () => {
    if (user?.id) {
      localStorage.removeItem(`planned_events_${user.id}`);
      localStorage.removeItem(`memories_${user.id}`);
      setPlannedCount(0);
      showToast.success('Demo reset! Refreshing page...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Today at a Glance Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#ffffff', animation: 'fadeInUp 0.6s ease-out' }}>Today at a glance ✨</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* XP Card */}
          <div className="card" 
            onMouseEnter={() => setHoveredCard('xp')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              cursor: 'pointer',
              transform: hoveredCard === 'xp' ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c9cff', marginBottom: '8px', animation: 'fadeInUp 0.8s ease-out' }}>
                {displayXP}
              </div>
              <div style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '12px' }}>XP</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                Level {user?.level || 1}
              </div>
              <div style={{ marginTop: '12px', height: '4px', background: '#ffffff10', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #7c9cff, #6af2c6)',
                  width: `${((displayXP || 0) % 1000) / 10}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* My Events Card */}
          <div className="card"
            onMouseEnter={() => setHoveredCard('events')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              cursor: 'pointer',
              transform: hoveredCard === 'events' ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6af2c6', marginBottom: '8px', animation: 'fadeInUp 0.8s ease-out 0.1s both' }}>
                {plannedCount}
              </div>
              <div style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '12px' }}>My Events</div>
              <div style={{ fontSize: '14px', color: '#c5cde3' }}>planned</div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="card"
            onMouseEnter={() => setHoveredCard('rewards')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              cursor: 'pointer',
              transform: hoveredCard === 'rewards' ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'all 0.3s ease'
            }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9f43', marginBottom: '8px', animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
                {events.length}
              </div>
              <div style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '12px' }}>Rewards</div>
              <div style={{ fontSize: '14px', color: '#c5cde3' }}>available</div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <Link to="/events" className="btn" style={{ textAlign: 'center', padding: '12px', animation: 'slideInRight 0.5s ease-out' }}>
            📅 Browse Events
          </Link>
          {isAdmin || isHost ? (
            <button className="btn" style={{ textAlign: 'center', padding: '12px', animation: 'slideInRight 0.5s ease-out 0.1s both' }} onClick={() => navigate('/rewards')}>
              🎯 Generate QR
            </button>
          ) : (
            <button className="btn" style={{ textAlign: 'center', padding: '12px', animation: 'slideInRight 0.5s ease-out 0.1s both' }} onClick={() => navigate('/scan-qr')}>
              📱 Scan QR
            </button>
          )}
          <Link to="/map" className="btn" style={{ textAlign: 'center', padding: '12px', animation: 'slideInRight 0.5s ease-out 0.2s both' }}>
            🗺️ Live Crowd Map
          </Link>
        </div>
      </div>

      {/* Quick Recommendations */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#ffffff', animation: 'fadeInUp 0.6s ease-out' }}>Quick Recommendations 🧠</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {loading ? (
            <Skeleton count={3} height="150px" />
          ) : (
            getTopEvents().map((event, index) => (
              <div key={event._id} className="card" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', transition: 'color 0.3s ease' }}>
                        {event.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#adb6d9', flexWrap: 'wrap' }}>
                        <span>📅 {event.time}</span>
                        <span>📍 {event.venue}</span>
                        <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff' }}>
                          {event.tag}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6af2c6', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>
                        +{event.points} XP
                      </div>
                      <button
                        className="btn"
                        style={{ padding: '8px 16px', fontSize: '12px', width: '100%' }}
                        onClick={() => handleAddToMyPlan(event)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Announcements Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#ffffff', animation: 'fadeInUp 0.6s ease-out' }}>Announcements 📣</h2>
        
        <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffffff10', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0px'}
            >
              <p style={{ margin: '0', color: '#c5cde3', lineHeight: '1.6' }}>
                🍽️ <strong>Food Court happy hour 4–5 PM</strong> (double XP on scans!)
              </p>
            </div>
            
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffffff10', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0px'}
            >
              <p style={{ margin: '0', color: '#c5cde3', lineHeight: '1.6' }}>
                🚁 <strong>Drone Show rehearsal at 6 PM</strong> near Football Ground.
              </p>
            </div>
            
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffffff10', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0px'}
            >
              <p style={{ margin: '0', color: '#c5cde3', lineHeight: '1.6' }}>
                🎟️ <strong>Use SAT-BONUS-25</strong> once per user 😉
              </p>
            </div>
            
            <div style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
              onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0px'}
            >
              <p style={{ margin: '0', color: '#c5cde3', lineHeight: '1.6' }}>
                🏆 <Link to="/leaderboard" style={{ color: '#7c9cff', textDecoration: 'none', fontWeight: '600' }}>
                  Check out the Leaderboard
                </Link> to see top performers!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', color: '#c5cde3', marginBottom: '4px' }}>
              {getTimeGreeting()}, <strong>{user?.name}!</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#adb6d9' }}>
              XP: <strong style={{ color: '#7c9cff' }}>{displayXP}</strong>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}></div>
        </div>
      </div>
    </div>
  );
}
