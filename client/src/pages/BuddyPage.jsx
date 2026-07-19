import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuddyResponses, getEvents } from '../api';

export default function BuddyPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.name}! 👋 I'm your FestifyXR Assistant. I can help you with:\n\n• 🎪 Finding events\n• 🗺️ Navigation around campus\n• 🏆 Tracking your XP and level\n• 🎁 Reward recommendations\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [buddyResponses, setBuddyResponses] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    loadBuddyResponses();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setAllEvents(response.data.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadBuddyResponses = async () => {
    try {
      const response = await getBuddyResponses();
      setBuddyResponses(response.data.data || []);
    } catch (error) {
      console.error('Error loading buddy responses:', error);
    }
  };

  const quickReplies = [
    { text: 'What is my XP?', emoji: '🏆' },
    { text: 'What is my plan?', emoji: '📅' },
    { text: 'How do I earn more XP?', emoji: '⭐' },
    { text: 'What rewards can I redeem?', emoji: '🎁' }
  ];

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: 'user', text };
    setMessages([...messages, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 500);
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Handle "what is my plan" or "my events" queries (check this FIRST before my xp)
    if (lowerQuery.includes('my plan') || lowerQuery.includes('my events') || lowerQuery.includes('planned') || (lowerQuery.includes('what') && lowerQuery.includes('plan'))) {
      const savedPlan = localStorage.getItem(`planned_events_${user?.id}`);
      if (!savedPlan) {
        return `📅 You don't have any events in your plan yet!\n\nHead over to the Events page to browse and add events to your plan. 🎪`;
      }
      
      const plannedEventIds = JSON.parse(savedPlan);
      const plannedEvents = allEvents.filter(event => plannedEventIds.includes(event._id));
      
      if (plannedEvents.length === 0) {
        return `📅 You don't have any events in your plan yet!\n\nHead over to the Events page to browse and add events to your plan. 🎪`;
      }
      
      const totalXP = plannedEvents.reduce((sum, event) => sum + event.points, 0);
      const eventList = plannedEvents.slice(0, 5).map(event => 
        `• ${event.title} - ${event.time} at ${event.venue} (+${event.points} XP)`
      ).join('\n');
      
      return `📅 Your Event Plan:\n\n${eventList}${plannedEvents.length > 5 ? `\n\n...and ${plannedEvents.length - 5} more events` : ''}\n\n🏆 Total potential XP: ${totalXP}\n\nCheck the My Plan page for full details!`;
    }
    
    // Handle "what is my xp" or "my stats" queries
    if (lowerQuery.includes('my xp') || lowerQuery.includes('my stats') || lowerQuery.includes('my level') || (lowerQuery.includes('what') && lowerQuery.includes('my') && (lowerQuery.includes('xp') || lowerQuery.includes('level')))) {
      return `🏆 Hey ${user?.name}!\n\nYour current stats:\n• XP: ${user?.xp || 0}\n• Level: ${user?.level || 1}\n\nKeep attending events and redeeming rewards to earn more XP! 🎉`;
    }
    
    // Check database for matching keyword
    for (let response of buddyResponses) {
      if (lowerQuery.includes(response.keyword.toLowerCase())) {
        return response.response.replace('${user?.xp || 0}', user?.xp || 0).replace('${user?.level || 1}', user?.level || 1);
      }
    }
    
    // Fallback to default responses
    if (lowerQuery.includes('event') || lowerQuery.includes('happening')) {
      return `🎪 You can check all upcoming events in the Events tab! Here are some popular ones:\n\n• DJ Night at Main Stage\n• Tech Workshop in Lab 3\n• Food Festival at Plaza\n\nHead to the Events page to see the full schedule!`;
    }
    
    if (lowerQuery.includes('xp') || lowerQuery.includes('points') || lowerQuery.includes('earn')) {
      return `⭐ You can earn XP by:\n\n• Attending events (20-50 XP each)\n• Checking into zones (10 XP)\n• Redeeming rewards with QR codes\n• Completing challenges\n\nYou currently have ${user?.xp || 0} XP at Level ${user?.level || 1}!`;
    }
    
    if (lowerQuery.includes('map') || lowerQuery.includes('navigate')) {
      return `🗺️ You can view the interactive campus map in the Map tab. It shows all zones and event locations. Just tap on any zone to see details!`;
    }
    
    if (lowerQuery.includes('reward') || lowerQuery.includes('redeem')) {
      return `🎁 Check out the Rewards page to see what you can redeem with your XP! We have:\n\n• Merchandise\n• Food vouchers\n• Priority passes\n• And more!\n\nYou have ${user?.xp || 0} XP to spend!`;
    }
    
    return `I'm here to help! Try asking me about:\n\n• Events and schedules 🎪\n• Earning XP and leveling up ⭐\n• Campus navigation 🗺️\n• Rewards and redemption 🎁\n• Your plan and stats 📊\n\nWhat would you like to know?`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px' }}>🤖 FestifyXR Buddy</h1>
          <p style={{ color: '#adb6d9', margin: 0 }}>Your personal festival assistant</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ marginBottom: '16px', height: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.role === 'user' ? '#7c9cff' : '#161b2b',
                  color: msg.role === 'user' ? '#fff' : '#eaf0ff',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #ffffff10' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                className="btn ghost"
                style={{ fontSize: '13px' }}
                onClick={() => handleSend(reply.text)}
              >
                {reply.emoji} {reply.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
          <input
            className="input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1 }}
          />
          <button className="btn" onClick={() => handleSend()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
