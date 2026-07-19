import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../api';
import { showToast } from '../utils/toast';
import Skeleton from '../components/Skeleton';

export default function LeaderboardPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load if auth is ready and we have a token
    if (!authLoading && accessToken) {
      loadLeaderboard();
    } else if (!authLoading && !accessToken) {
      // If auth is ready but no token, show empty state
      setLoading(false);
    }
  }, [accessToken, authLoading]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getLeaderboard();
      setLeaderboardData(response.data.data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showToast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '20px', animation: 'fadeInUp 0.6s ease-out' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 12px' }}>🏆 Leaderboard</h1>
          <p style={{ color: '#adb6d9' }}>Compete with other participants and climb to the top!</p>
        </div>
      </div>

      {loading ? (
        <Skeleton count={8} height="120px" />
      ) : leaderboardData.length === 0 ? (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: '#adb6d9' }}>
            No participants yet. Be the first to earn XP!
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {leaderboardData.slice(0, 3).map((player, index) => (
          <div key={player._id} className="card" style={{ animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both` }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>{getMedalEmoji(index + 1)}</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{player.name}</div>
              <div style={{ color: '#7c9cff', fontSize: '20px', fontWeight: 'bold' }}>{player.xp} XP</div>
              <div style={{ color: '#adb6d9', fontSize: '14px' }}>Level {player.level}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="card" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
        <div style={{ padding: '20px' }}>
          <h2 style={{ margin: '0 0 16px' }}>All Rankings</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            {leaderboardData.map((player, index) => (
              <div
                key={player._id}
                style={{
                  padding: '16px',
                  background: player.isCurrentUser ? '#7c9cff22' : '#0f1524',
                  border: player.isCurrentUser ? '2px solid #7c9cff' : 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '40px' }}>
                    {getMedalEmoji(player.rank)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {player.name}
                      {player.isCurrentUser && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#7c9cff' }}>(You)</span>
                      )}
                    </div>
                    <div style={{ color: '#adb6d9', fontSize: '14px' }}>Level {player.level}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c9cff' }}>{player.xp}</div>
                  <div style={{ fontSize: '12px', color: '#adb6d9' }}>XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
