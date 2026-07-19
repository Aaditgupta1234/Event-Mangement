import React, { useState, useRef, useEffect } from 'react';
import { redeemReward } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';

export default function QRScannerPage() {
  const { user, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [xpGained, setXpGained] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (error) {
      setMessage('Unable to access camera: ' + error.message);
      setMessageType('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setScanning(false);
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      setMessage('Please enter a QR code');
      setMessageType('error');
      return;
    }
    await redeemQRCode(qrCode.trim());
  };

  const redeemQRCode = async (code) => {
    try {
      setMessage('');
      const response = await redeemReward(code);
      
      // Update user context with new XP and level
      if (response.data.data.user) {
        const tokens = { accessToken: localStorage.getItem('accessToken'), refreshToken: localStorage.getItem('refreshToken') };
        login(response.data.data.user, tokens);
      }
      
      setMessage(response.data.message || 'Reward redeemed successfully!');
      setMessageType('success');
      setRedeemedReward(response.data.data.reward);
      setXpGained(response.data.data.xpGained);
      setQrCode('');
      stopCamera();
      
      showToast.success(`🎉 +${response.data.data.xpGained} XP earned!`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to redeem reward';
      setMessage(errorMsg);
      setMessageType('error');
      showToast.error(errorMsg);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        // Simple QR extraction - in production, use a proper QR library
        setMessage('Please enter the QR code manually from the image');
        setMessageType('error');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
          <h1 style={{ margin: '0 0 12px' }}>Scan Reward QR Code</h1>
          <p style={{ color: '#adb6d9', margin: 0 }}>
            Scan a QR code from the admin to redeem your reward
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="card" style={{ 
          marginBottom: '20px',
          background: messageType === 'success' ? '#6af2c622' : '#ff5d6c22',
          border: `2px solid ${messageType === 'success' ? '#6af2c6' : '#ff5d6c'}`
        }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {messageType === 'success' ? '✓' : '⚠️'}
            </div>
            <p style={{ 
              margin: 0, 
              color: messageType === 'success' ? '#6af2c6' : '#ff5d6c',
              fontWeight: '600'
            }}>
              {message}
            </p>
            {redeemedReward && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎁</div>
                <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{redeemedReward.title}</h3>
                <div className="pill" style={{ 
                  background: '#6af2c622', 
                  color: '#6af2c6',
                  padding: '8px 16px',
                  display: 'inline-block',
                  marginTop: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  +{xpGained} XP
                </div>
                {user && (
                  <div style={{ marginTop: '16px', fontSize: '14px', color: '#adb6d9' }}>
                    <div>Total XP: <strong style={{ color: '#7c9cff' }}>{user.xp}</strong></div>
                    <div>Level: <strong style={{ color: '#6af2c6' }}>{user.level}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camera Scanner */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px' }}>📷 Camera Scanner</h2>
          
          {!scanning ? (
            <button 
              className="btn" 
              style={{ width: '100%' }}
              onClick={startCamera}
            >
              Open Camera
            </button>
          ) : (
            <div>
              <div style={{ 
                background: 'black', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                marginBottom: '12px',
                position: 'relative'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  border: '3px solid #6af2c6',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }} />
              </div>
              <button 
                className="btn" 
                style={{ width: '100%', background: '#ff5d6c' }}
                onClick={stopCamera}
              >
                Close Camera
              </button>
              <p style={{ color: '#adb6d9', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                Position the QR code within the highlighted area and use manual entry below
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px' }}>⌨️ Manual Entry</h2>
          <form onSubmit={handleManualEntry}>
            <input
              type="text"
              className="input"
              placeholder="Enter QR code"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <button type="submit" className="btn" style={{ width: '100%' }}>
              Redeem Reward
            </button>
          </form>
        </div>
      </div>

      {/* Upload QR Image */}
      <div className="card">
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px' }}>📤 Upload QR Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffffff10',
              border: '1px solid #6af2c6',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          />
          <p style={{ color: '#adb6d9', fontSize: '12px', marginTop: '8px' }}>
            Upload an image of the QR code, then enter the code manually
          </p>
        </div>
      </div>
    </div>
  );
}
