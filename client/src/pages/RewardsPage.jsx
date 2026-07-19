import React, { useState, useEffect } from 'react';
import { getRewards } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RewardsPage() {
  const navigate = useNavigate();
  const { isAdmin, isHost } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await getRewards();
      setRewards(response.data.data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading rewards...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h1 style={{ margin: '0 0 12px' }}>Rewards Marketplace</h1>
            <p style={{ color: '#adb6d9', margin: '0 0 16px' }}>Redeem your XP points for amazing rewards!</p>
          </div>
          {!(isAdmin || isHost) && (
            <button 
              className="btn" 
              onClick={() => navigate('/scan-qr')}
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #7c9cff, #6af2c6)',
                fontSize: '16px',
                padding: '14px'
              }}
            >
              📸 Scan QR Code to Redeem
            </button>
          )}
          {(isAdmin || isHost) && (
            <div style={{
              padding: '14px',
              background: '#7c9cff22',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid #7c9cff44'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔑</div>
              <div style={{ color: '#7c9cff', fontWeight: 600 }}>Admin/Host View</div>
              <div style={{ color: '#adb6d9', fontSize: '14px', marginTop: '4px' }}>Generate QR codes directly from rewards</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {rewards.map((reward) => (
          <div key={reward._id} className="card">
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>{reward.title}</h3>
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#7c9cff22',
                color: '#7c9cff',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                {reward.cost} XP
              </div>
              {!(isAdmin || isHost) && (
                <div>
                  <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/scan-qr')}>Redeem</button>
                </div>
              )}
              {(isAdmin || isHost) && (
                <div>
                  <button
                    className="btn ghost"
                    style={{ width: '100%' }}
                    onClick={() => {
                      const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(reward.qrCode || reward._id)}`;
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${reward.title.replace(/[^a-z0-9]/gi, '_')}-QR.png`;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      link.click();
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    📥 Generate QR
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: '#adb6d9' }}>
            No rewards available at the moment
          </div>
        </div>
      )}
    </div>
  );
}
