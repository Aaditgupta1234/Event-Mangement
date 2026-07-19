import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getEvents, createEvent, updateEvent, deleteEvent,
  getZones, createZone, updateZone, deleteZone,
  getRewards, createReward, updateReward, deleteReward, regenerateQR,
  getBuddyResponses, createBuddyResponse, updateBuddyResponse, deleteBuddyResponse,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement
} from '../api';
import { exportToExcel, ExportButton } from '../utils/exportUtils.jsx';
import API, { getApiBaseUrl } from '../api';

export default function HostDashboard() {
  const { user, isHost } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Events State
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '', desc: '', time: '', venue: '', points: 0, tag: 'Music'
  });

  // Zones State
  const [zones, setZones] = useState([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: '', description: '', icon: '📍', x: 50, y: 50
  });

  // Rewards State
  const [rewards, setRewards] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    title: '', cost: 0
  });

  // Buddy AI Responses State
  const [buddyResponses, setBuddyResponses] = useState([]);
  const [showBuddyModal, setShowBuddyModal] = useState(false);
  const [editingBuddy, setEditingBuddy] = useState(null);
  const [buddyForm, setBuddyForm] = useState({
    keyword: '', trigger: 'general', response: ''
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '', content: '', icon: '📢', priority: 'medium', active: true
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Home Page Settings State
  const [homeSettings, setHomeSettings] = useState({
    showAnnouncements: true,
    showQuickRecommendations: true,
    showQuickActions: true,
    showXPCard: true,
    showEventsCard: true,
    showRewardsCard: true,
    featuredEventsCount: 3
  });

  // Pagination State
  const [eventsPage, setEventsPage] = useState(1);
  const [zonesPage, setZonesPage] = useState(1);
  const [rewardsPage, setRewardsPage] = useState(1);
  const [buddyPage, setBuddyPage] = useState(1);
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!isHost) {
      navigate('/');
      return;
    }
    loadData();
  }, [isHost]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, zonesRes, rewardsRes, buddyRes, announcementsRes] = await Promise.all([
        getEvents(),
        getZones(),
        getRewards(),
        getBuddyResponses(),
        getAnnouncements()
      ]);
      setEvents(eventsRes.data.data || []);
      setZones(zonesRes.data.data || []);
      setRewards(rewardsRes.data.data || []);
      setBuddyResponses(buddyRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);
      await loadUsers();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await API.get('/auth/users');
      setUsers(response.data.data || []);
      setTotalUsers(response.data.data?.length || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Event Handlers
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(eventForm);
      setShowEventModal(false);
      resetEventForm();
      loadData();
    } catch (error) {
      alert('Error creating event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await updateEvent(editingEvent._id, eventForm);
      setShowEventModal(false);
      setEditingEvent(null);
      resetEventForm();
      loadData();
    } catch (error) {
      alert('Error updating event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      loadData();
    } catch (error) {
      alert('Error deleting event: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      desc: event.desc,
      time: event.time,
      venue: event.venue,
      points: event.points,
      tag: event.tag
    });
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEventForm({ title: '', desc: '', time: '', venue: '', points: 0, tag: 'Music' });
    setEditingEvent(null);
  };

  // Zone Handlers
  const handleCreateZone = async (e) => {
    e.preventDefault();
    try {
      await createZone(zoneForm);
      setShowZoneModal(false);
      resetZoneForm();
      loadData();
    } catch (error) {
      alert('Error creating zone: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateZone = async (e) => {
    e.preventDefault();
    try {
      await updateZone(editingZone._id, zoneForm);
      setShowZoneModal(false);
      setEditingZone(null);
      resetZoneForm();
      loadData();
    } catch (error) {
      alert('Error updating zone: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteZone = async (id) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await deleteZone(id);
      loadData();
    } catch (error) {
      alert('Error deleting zone: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditZone = (zone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description,
      icon: zone.icon,
      x: zone.x,
      y: zone.y
    });
    setShowZoneModal(true);
  };

  const resetZoneForm = () => {
    setZoneForm({ name: '', description: '', icon: '📍', x: 50, y: 50 });
    setEditingZone(null);
  };

  // Reward Handlers
  const handleCreateReward = async (e) => {
    e.preventDefault();
    try {
      await createReward(rewardForm);
      setShowRewardModal(false);
      resetRewardForm();
      loadData();
    } catch (error) {
      alert('Error creating reward: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    try {
      await updateReward(editingReward._id, rewardForm);
      setShowRewardModal(false);
      setEditingReward(null);
      resetRewardForm();
      loadData();
    } catch (error) {
      alert('Error updating reward: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteReward = async (id) => {
    if (!confirm('Delete this reward?')) return;
    try {
      await deleteReward(id);
      loadData();
    } catch (error) {
      alert('Error deleting reward: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditReward = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      title: reward.title,
      cost: reward.cost
    });
    setShowRewardModal(true);
  };

  const resetRewardForm = () => {
    setRewardForm({ title: '', cost: 0 });
    setEditingReward(null);
  };

  const handleRegenerateQR = async (id) => {
    if (!confirm('Regenerate QR code for this reward? This will reset redemption status.')) return;
    try {
      await regenerateQR(id);
      loadData();
      alert('QR code regenerated successfully!');
    } catch (error) {
      alert('Error regenerating QR: ' + (error.response?.data?.message || error.message));
    }
  };

  const downloadQRCode = (reward) => {
    const canvas = document.getElementById(`qr-${reward._id}`);
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reward.title}-QR.png`;
      link.click();
    }
  };

  // Buddy AI Response Handlers
  const handleCreateBuddy = async (e) => {
    e.preventDefault();
    try {
      await createBuddyResponse(buddyForm);
      setShowBuddyModal(false);
      resetBuddyForm();
      loadData();
    } catch (error) {
      alert('Error creating buddy response: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateBuddy = async (e) => {
    e.preventDefault();
    try {
      await updateBuddyResponse(editingBuddy._id, buddyForm);
      setShowBuddyModal(false);
      setEditingBuddy(null);
      resetBuddyForm();
      loadData();
    } catch (error) {
      alert('Error updating buddy response: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteBuddy = async (id) => {
    if (!confirm('Delete this buddy response?')) return;
    try {
      await deleteBuddyResponse(id);
      loadData();
    } catch (error) {
      alert('Error deleting buddy response: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditBuddy = (buddy) => {
    setEditingBuddy(buddy);
    setBuddyForm({
      keyword: buddy.keyword,
      trigger: buddy.trigger,
      response: buddy.response
    });
    setShowBuddyModal(true);
  };

  const resetBuddyForm = () => {
    setBuddyForm({ keyword: '', trigger: 'general', response: '' });
    setEditingBuddy(null);
  };

  // Announcement Handlers
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement(announcementForm);
      setShowAnnouncementModal(false);
      resetAnnouncementForm();
      loadData();
    } catch (error) {
      alert('Error creating announcement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await updateAnnouncement(editingAnnouncement._id, announcementForm);
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      resetAnnouncementForm();
      loadData();
    } catch (error) {
      alert('Error updating announcement: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      loadData();
    } catch (error) {
      alert('Error deleting announcement: ' + (error.response?.data?.message || error.message));
    }
  };

  const openEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      icon: announcement.icon,
      priority: announcement.priority,
      active: announcement.active
    });
    setShowAnnouncementModal(true);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({ title: '', content: '', icon: '📢', priority: 'medium', active: true });
    setEditingAnnouncement(null);
  };

  // Export Handlers
  const handleExportParticipants = async () => {
    setExportLoading(true);
    try {
      await exportToExcel(`${getApiBaseUrl()}/export/participants`, `FestifyXR-Participants-${new Date().toLocaleDateString()}.xlsx`);
      alert('✅ Participants exported successfully!');
    } catch (error) {
      alert('❌ Error exporting participants: ' + (error.message || 'Unknown error'));
    } finally {
      setExportLoading(false);
    }
  };

  // Pagination
  const paginateItems = (items, page) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const paginateUsers = (users, page) => {
    const start = (page - 1) * usersPerPage;
    return users.slice(start, start + usersPerPage);
  };

  const totalPages = (items) => Math.ceil(items.length / itemsPerPage);
  const visibleUsers = users.filter((u) => u.role === 'participant');
  const totalUserPages = Math.ceil(visibleUsers.length / usersPerPage);

  if (!isHost) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px' }}>🎯 Host Dashboard</h1>
          <p style={{ color: '#adb6d9', margin: 0 }}>Manage all aspects of FestifyXR</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'events' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('events')}
        >
          📅 Events ({events.length})
        </button>
        <button
          className={`btn ${activeTab === 'zones' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('zones')}
        >
          📍 Zones ({zones.length})
        </button>
        <button
          className={`btn ${activeTab === 'rewards' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('rewards')}
        >
          🎁 Rewards ({rewards.length})
        </button>
        <button
          className={`btn ${activeTab === 'users' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({visibleUsers.length})
        </button>
        <button
          className={`btn ${activeTab === 'buddy' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('buddy')}
        >
          🤖 Buddy AI ({buddyResponses.length})
        </button>
        <button
          className={`btn ${activeTab === 'announcements' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements ({announcements.length})
        </button>
        <button
          className={`btn ${activeTab === 'homeSettings' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('homeSettings')}
        >
          🏠 Home Settings
        </button>
        <button
          className={`btn ${activeTab === 'export' ? '' : 'ghost'}`}
          onClick={() => setActiveTab('export')}
        >
          📊 Export Participants
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Events Management</h2>
            <button className="btn" onClick={() => setShowEventModal(true)}>
              + Add Event
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {paginateItems(events, eventsPage).map((event) => (
              <div key={event._id} className="card">
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px' }}>{event.title}</h3>
                    <p style={{ color: '#adb6d9', margin: '0 0 8px', fontSize: '14px' }}>{event.desc}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#adb6d9' }}>
                      <span>🕒 {event.time}</span>
                      <span>📍 {event.venue}</span>
                      <span className="pill">+{event.points} XP</span>
                      <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff' }}>{event.tag}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn ghost" onClick={() => openEditEvent(event)}>Edit</button>
                    <button className="btn" style={{ background: '#ff5d6c' }} onClick={() => handleDeleteEvent(event._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages(events) > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                className="btn ghost"
                disabled={eventsPage === 1}
                onClick={() => setEventsPage(eventsPage - 1)}
              >
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {eventsPage} of {totalPages(events)}
              </span>
              <button
                className="btn ghost"
                disabled={eventsPage === totalPages(events)}
                onClick={() => setEventsPage(eventsPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Zones Management</h2>
            <button className="btn" onClick={() => setShowZoneModal(true)}>
              + Add Zone
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {paginateItems(zones, zonesPage).map((zone) => (
              <div key={zone._id} className="card">
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>{zone.icon}</div>
                  <h3 style={{ margin: '0 0 8px' }}>{zone.name}</h3>
                  <p style={{ color: '#adb6d9', margin: '0 0 12px', fontSize: '14px' }}>{zone.description}</p>
                  <div style={{ fontSize: '12px', color: '#adb6d9', marginBottom: '12px' }}>
                    Position: ({zone.x}%, {zone.y}%)
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn ghost" style={{ flex: 1 }} onClick={() => openEditZone(zone)}>Edit</button>
                    <button className="btn" style={{ background: '#ff5d6c' }} onClick={() => handleDeleteZone(zone._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages(zones) > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button className="btn ghost" disabled={zonesPage === 1} onClick={() => setZonesPage(zonesPage - 1)}>
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {zonesPage} of {totalPages(zones)}
              </span>
              <button
                className="btn ghost"
                disabled={zonesPage === totalPages(zones)}
                onClick={() => setZonesPage(zonesPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Rewards Management</h2>
            <button className="btn" onClick={() => setShowRewardModal(true)}>
              + Add Reward
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {paginateItems(rewards, rewardsPage).map((reward) => (
              <div key={reward._id} className="card">
                <div style={{ padding: '24px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
                    <h3 style={{ margin: '0 0 8px' }}>{reward.title}</h3>
                    <div className="pill" style={{ background: '#6af2c622', color: '#6af2c6', fontSize: '16px', marginBottom: '12px' }}>
                      {reward.cost} XP
                    </div>
                    
                    {/* Redeem Status */}
                    <div style={{ marginBottom: '12px' }}>
                      {reward.redeemed ? (
                        <div className="pill" style={{ background: '#ff5d6c22', color: '#ff5d6c', fontSize: '12px' }}>
                          ✓ Redeemed
                        </div>
                      ) : (
                        <div className="pill" style={{ background: '#ffd60a22', color: '#ffd60a', fontSize: '12px' }}>
                          ⏳ Not Redeemed
                        </div>
                      )}
                    </div>

                    {/* QR Code Generation Section */}
                    <div style={{
                      background: 'rgba(106, 242, 198, 0.05)',
                      border: '1px solid rgba(106, 242, 198, 0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#6af2c6', fontWeight: 'bold', marginBottom: '8px' }}>
                        🎯 QR CODE GENERATION
                      </div>
                      <button 
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          marginBottom: '8px'
                        }} 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(reward.qrCode || reward._id)}`;
                          link.download = `${reward.title.replace(/[^a-z0-9]/gi, '_')}-QR.png`;
                          link.click();
                        }}
                      >
                        📥 Generate & Download QR
                      </button>
                      <button 
                        className="btn ghost" 
                        style={{ width: '100%', fontSize: '13px' }} 
                        onClick={() => handleRegenerateQR(reward._id)}
                      >
                        🔄 Regenerate New QR Code
                      </button>
                    </div>
                  </div>
                  
                  {/* QR Code Preview */}
                  <div style={{ 
                    background: 'white', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#999', fontWeight: 'bold', marginBottom: '4px' }}>CURRENT QR CODE</div>
                    <iframe
                      id={`qr-frame-${reward._id}`}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reward.qrCode || reward._id)}`}
                      style={{ width: '150px', height: '150px', border: 'none' }}
                      title="QR Code"
                    />
                    <div style={{ fontSize: '10px', color: '#666', wordBreak: 'break-all', textAlign: 'center', fontFamily: 'monospace' }}>
                      {reward.qrCode || reward._id}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn ghost" style={{ flex: 1 }} onClick={() => openEditReward(reward)}>
                      ✏️ Edit
                    </button>
                    <button className="btn" style={{ background: '#ff5d6c', flex: 1 }} onClick={() => handleDeleteReward(reward._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages(rewards) > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button className="btn ghost" disabled={rewardsPage === 1} onClick={() => setRewardsPage(rewardsPage - 1)}>
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {rewardsPage} of {totalPages(rewards)}
              </span>
              <button
                className="btn ghost"
                disabled={rewardsPage === totalPages(rewards)}
                onClick={() => setRewardsPage(rewardsPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Users Management</h2>
          </div>

          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ffffff20' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Level</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>XP</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Role</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {paginateUsers(visibleUsers, usersPage).map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #ffffff10' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c9cff, #6af2c6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '600' }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#adb6d9' }}>{user.email}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span className="pill">{user.level || 1}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#7c9cff', fontWeight: 'bold' }}>
                        {user.xp || 0}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span className="pill" style={{
                          background: user.role === 'admin' ? '#ff9f4322' : user.role === 'host' ? '#7c9cff22' : '#6af2c622',
                          color: user.role === 'admin' ? '#ff9f43' : user.role === 'host' ? '#7c9cff' : '#6af2c6'
                        }}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#adb6d9', fontSize: '13px' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalUserPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button className="btn ghost" disabled={usersPage === 1} onClick={() => setUsersPage(usersPage - 1)}>
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {usersPage} of {totalUserPages}
              </span>
              <button
                className="btn ghost"
                disabled={usersPage === totalUserPages}
                onClick={() => setUsersPage(usersPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Buddy AI Tab */}
      {activeTab === 'buddy' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Buddy AI Responses</h2>
            <button className="btn" onClick={() => setShowBuddyModal(true)}>
              + Add Response
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {paginateItems(buddyResponses, buddyPage).map((buddy) => (
              <div key={buddy._id} className="card">
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px' }}>
                        <span className="pill" style={{ background: '#7c9cff22', color: '#7c9cff', marginRight: '8px' }}>
                          {buddy.keyword}
                        </span>
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <span className="pill" style={{ background: '#6af2c622', color: '#6af2c6' }}>
                          {buddy.trigger}
                        </span>
                      </div>
                      <p style={{ color: '#adb6d9', margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
                        {buddy.response}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                      <button className="btn ghost" onClick={() => openEditBuddy(buddy)}>Edit</button>
                      <button className="btn" style={{ background: '#ff5d6c' }} onClick={() => handleDeleteBuddy(buddy._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages(buddyResponses) > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button className="btn ghost" disabled={buddyPage === 1} onClick={() => setBuddyPage(buddyPage - 1)}>
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {buddyPage} of {totalPages(buddyResponses)}
              </span>
              <button
                className="btn ghost"
                disabled={buddyPage === totalPages(buddyResponses)}
                onClick={() => setBuddyPage(buddyPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Announcements Management</h2>
            <button className="btn" onClick={() => setShowAnnouncementModal(true)}>
              + Add Announcement
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {paginateItems(announcements, announcementsPage).map((announcement) => (
              <div key={announcement._id} className="card">
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{announcement.icon}</span>
                        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>
                          {announcement.title}
                        </h3>
                        <span className="pill" style={{
                          background: announcement.priority === 'high' ? '#ff5d6c22' : announcement.priority === 'medium' ? '#ff9f4322' : '#6af2c622',
                          color: announcement.priority === 'high' ? '#ff5d6c' : announcement.priority === 'medium' ? '#ff9f43' : '#6af2c6'
                        }}>
                          {announcement.priority.toUpperCase()}
                        </span>
                        <span className="pill" style={{
                          background: announcement.active ? '#6af2c622' : '#ffffff10',
                          color: announcement.active ? '#6af2c6' : '#adb6d9'
                        }}>
                          {announcement.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ color: '#adb6d9', margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
                        {announcement.content}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                      <button className="btn ghost" onClick={() => openEditAnnouncement(announcement)}>Edit</button>
                      <button className="btn" style={{ background: '#ff5d6c' }} onClick={() => handleDeleteAnnouncement(announcement._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages(announcements) > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button className="btn ghost" disabled={announcementsPage === 1} onClick={() => setAnnouncementsPage(announcementsPage - 1)}>
                Previous
              </button>
              <span style={{ padding: '10px 16px', color: '#adb6d9' }}>
                Page {announcementsPage} of {totalPages(announcements)}
              </span>
              <button
                className="btn ghost"
                disabled={announcementsPage === totalPages(announcements)}
                onClick={() => setAnnouncementsPage(announcementsPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Home Settings Tab */}
      {activeTab === 'homeSettings' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: '20px' }}>🏠 Home Page Settings</h2>
              <p style={{ color: '#adb6d9', marginBottom: '24px' }}>Control what sections and content are displayed on the user home page</p>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Statistics Cards Section */}
                <div className="card" style={{ background: '#ffffff0a', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px' }}>📊 Statistics Cards</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showXPCard"
                      checked={homeSettings.showXPCard}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showXPCard: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showXPCard" style={{ cursor: 'pointer', margin: 0 }}>Show XP Card</label>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showEventsCard"
                      checked={homeSettings.showEventsCard}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showEventsCard: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showEventsCard" style={{ cursor: 'pointer', margin: 0 }}>Show My Events Card</label>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showRewardsCard"
                      checked={homeSettings.showRewardsCard}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showRewardsCard: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showRewardsCard" style={{ cursor: 'pointer', margin: 0 }}>Show Rewards Card</label>
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="card" style={{ background: '# ffffff0a', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px' }}>⚡ Quick Actions</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showQuickActions"
                      checked={homeSettings.showQuickActions}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showQuickActions: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showQuickActions" style={{ cursor: 'pointer', margin: 0 }}>Show Quick Action Buttons</label>
                  </div>
                </div>

                {/* Quick Recommendations Section */}
                <div className="card" style={{ background: '#ffffff0a', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px' }}>🧠 Quick Recommendations</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showQuickRecommendations"
                      checked={homeSettings.showQuickRecommendations}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showQuickRecommendations: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showQuickRecommendations" style={{ cursor: 'pointer', margin: 0 }}>Show Recommendations Section</label>
                  </div>
                  
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Number of Featured Events</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={homeSettings.featuredEventsCount}
                    onChange={(e) => setHomeSettings({ ...homeSettings, featuredEventsCount: parseInt(e.target.value) })}
                    className="input"
                    style={{ marginBottom: '8px' }}
                  />
                </div>

                {/* Announcements Section */}
                <div className="card" style={{ background: '#ffffff0a', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px' }}>📣 Announcements</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id="showAnnouncements"
                      checked={homeSettings.showAnnouncements}
                      onChange={(e) => setHomeSettings({ ...homeSettings, showAnnouncements: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="showAnnouncements" style={{ cursor: 'pointer', margin: 0 }}>Show Announcements Section</label>
                  </div>
                </div>
              </div>

              {/* Save Settings */}
              <button
                className="btn"
                onClick={() => {
                  localStorage.setItem('homePageSettings', JSON.stringify(homeSettings));
                  alert('Home page settings saved successfully!');
                }}
                style={{ marginTop: '20px', width: '100%' }}
              >
                💾 Save Settings
              </button>

              {/* Preview Info */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#7c9cff22',
                borderRadius: '8px',
                color: '#7c9cff',
                fontSize: '13px'
              }}>
                ℹ️ Settings are saved to browser storage and will be applied on the home page for all users.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Tab */}
      {activeTab === 'export' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginBottom: '20px' }}>📊 Export Participant Data to Excel</h2>
              <p style={{ color: '#adb6d9', marginBottom: '24px' }}>
                Download participant information in Excel format for your event analysis and reporting
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {/* Export Participants */}
                <div className="card" style={{ background: '#ffffff0a', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px' }}>👥 Participants List</h3>
                  <p style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '16px' }}>
                    Export all registered participants with their email addresses, XP, and level information
                  </p>
                  <ExportButton
                    onClick={handleExportParticipants}
                    loading={exportLoading}
                    disabled={loading}
                  >
                    Export All Participants
                  </ExportButton>
                </div>
              </div>

              {/* Info Box */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                borderRadius: '8px',
                border: '1px solid #667eea44',
                color: '#7c9cff'
              }}>
                <h4 style={{ margin: '0 0 8px' }}>ℹ️ Export Information</h4>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Excel file includes serial numbers and formatted headers</li>
                  <li>Data includes email addresses, XP, level, and registration dates</li>
                  <li>Dates are formatted for easy reading</li>
                  <li>Files are automatically named with the current date</li>
                </ul>
              </div>

              {/* Features Box */}
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: '#ffffff0a',
                borderRadius: '8px',
                border: '1px solid #ffffff1a'
              }}>
                <h4 style={{ margin: '0 0 8px' }}>✨ File Features</h4>
                <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#adb6d9', fontSize: '14px' }}>
                  <li>Professionally formatted Excel sheet</li>
                  <li>Color-coded headers for easy navigation</li>
                  <li>Auto-adjusted column widths</li>
                  <li>Ready for mail merge and further analysis</li>
                  <li>Compatible with Excel, Google Sheets, and LibreOffice</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => { setShowEventModal(false); resetEventForm(); }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Title</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Description</label>
                  <textarea
                    className="input"
                    required
                    rows="3"
                    value={eventForm.desc}
                    onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Time</label>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="e.g., 6:00 PM - 8:00 PM"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Venue</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Points</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min="0"
                    value={eventForm.points}
                    onChange={(e) => setEventForm({ ...eventForm, points: parseInt(e.target.value) })}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Tag</label>
                  <select
                    className="input"
                    value={eventForm.tag}
                    onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })}
                  >
                    <option value="Music">Music</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Food">Food</option>
                    <option value="Tech">Tech</option>
                    <option value="Art">Art</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }}
                    onClick={() => { setShowEventModal(false); resetEventForm(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Zone Modal */}
      {showZoneModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => { setShowZoneModal(false); resetZoneForm(); }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>{editingZone ? 'Edit Zone' : 'Create New Zone'}</h2>
              <form onSubmit={editingZone ? handleUpdateZone : handleCreateZone}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Name</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Description</label>
                  <textarea
                    className="input"
                    required
                    rows="2"
                    value={zoneForm.description}
                    onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Icon (Emoji)</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={zoneForm.icon}
                    onChange={(e) => setZoneForm({ ...zoneForm, icon: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>X Position (%)</label>
                    <input
                      className="input"
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={zoneForm.x}
                      onChange={(e) => setZoneForm({ ...zoneForm, x: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Y Position (%)</label>
                    <input
                      className="input"
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={zoneForm.y}
                      onChange={(e) => setZoneForm({ ...zoneForm, y: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>{editingZone ? 'Update' : 'Create'}</button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }}
                    onClick={() => { setShowZoneModal(false); resetZoneForm(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => { setShowRewardModal(false); resetRewardForm(); }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>{editingReward ? 'Edit Reward' : 'Create New Reward'}</h2>
              <form onSubmit={editingReward ? handleUpdateReward : handleCreateReward}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Title</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={rewardForm.title}
                    onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Cost (XP)</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min="0"
                    value={rewardForm.cost}
                    onChange={(e) => setRewardForm({ ...rewardForm, cost: parseInt(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>{editingReward ? 'Update' : 'Create'}</button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }}
                    onClick={() => { setShowRewardModal(false); resetRewardForm(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Buddy AI Modal */}
      {showBuddyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => { setShowBuddyModal(false); resetBuddyForm(); }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>{editingBuddy ? 'Edit Buddy Response' : 'Create New Buddy Response'}</h2>
              <form onSubmit={editingBuddy ? handleUpdateBuddy : handleCreateBuddy}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Keyword</label>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="e.g., events, xp, map, rewards"
                    value={buddyForm.keyword}
                    onChange={(e) => setBuddyForm({ ...buddyForm, keyword: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Trigger Type</label>
                  <select
                    className="input"
                    value={buddyForm.trigger}
                    onChange={(e) => setBuddyForm({ ...buddyForm, trigger: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="events">Events</option>
                    <option value="xp">XP</option>
                    <option value="map">Map</option>
                    <option value="rewards">Rewards</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Response</label>
                  <textarea
                    className="input"
                    required
                    rows="4"
                    placeholder="Enter the AI response..."
                    value={buddyForm.response}
                    onChange={(e) => setBuddyForm({ ...buddyForm, response: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    {editingBuddy ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }}
                    onClick={() => { setShowBuddyModal(false); resetBuddyForm(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => { setShowAnnouncementModal(false); resetAnnouncementForm(); }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
              <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Title</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Content</label>
                  <textarea
                    className="input"
                    required
                    rows="3"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Icon (Emoji)</label>
                  <input
                    className="input"
                    type="text"
                    required
                    value={announcementForm.icon}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, icon: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Priority</label>
                  <select
                    className="input"
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="active"
                    checked={announcementForm.active}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="active" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer', margin: 0 }}>
                    Active
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn" style={{ flex: 1 }}>
                    {editingAnnouncement ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn ghost" style={{ flex: 1 }}
                    onClick={() => { setShowAnnouncementModal(false); resetAnnouncementForm(); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
