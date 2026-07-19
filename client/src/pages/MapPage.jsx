import React, { useState, useEffect } from 'react';
import { getZones } from '../api';

export default function MapPage() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await getZones();
      setZones(response.data.data || []);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="card">
        <div style={{ padding: '20px' }}>
          <h1 style={{ margin: '0 0 20px' }}>Campus Map & Zones</h1>
          
          {/* Map Container */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0d1220 0%, #1a1f35 100%)',
            height: '500px',
            borderRadius: '16px',
            border: '1px solid #ffffff10',
            overflow: 'hidden'
          }}>
            {zones.map((zone) => (
              <div
                key={zone._id}
                onClick={() => setSelectedZone(zone)}
                style={{
                  position: 'absolute',
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)',
                  padding: '12px 16px',
                  background: selectedZone?._id === zone._id ? '#7c9cff33' : '#ffffff08',
                  border: selectedZone?._id === zone._id ? '2px solid #7c9cff' : '1px solid #ffffff20',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7c9cff33';
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (selectedZone?._id !== zone._id) {
                    e.currentTarget.style.background = '#ffffff08';
                  }
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
              >
                {zone.icon} {zone.name}
              </div>
            ))}
          </div>

          {/* Zone Info */}
          {selectedZone && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: '#0f1524',
              borderRadius: '12px',
              border: '1px solid #7c9cff44'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{selectedZone.icon}</span>
                <h3 style={{ margin: 0, fontSize: '24px' }}>{selectedZone.name}</h3>
              </div>
              <p style={{ color: '#adb6d9', margin: '0 0 16px' }}>{selectedZone.description}</p>
              <button className="btn">Check-in Here</button>
            </div>
          )}
        </div>
      </div>

      {/* Zone List */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ margin: '0 0 16px' }}>All Zones</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {zones.map((zone) => (
              <div
                key={zone._id}
                onClick={() => setSelectedZone(zone)}
                style={{
                  padding: '16px',
                  background: selectedZone?._id === zone._id ? '#7c9cff22' : '#0f1524',
                  border: selectedZone?._id === zone._id ? '2px solid #7c9cff' : '1px solid #ffffff10',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{zone.icon}</div>
                <div style={{ fontWeight: 'bold' }}>{zone.name}</div>
                <div style={{ color: '#adb6d9', fontSize: '13px', marginTop: '4px' }}>
                  {zone.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
