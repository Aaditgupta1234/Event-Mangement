import React from 'react';
import PropTypes from 'prop-types';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  };

  const CardSkeleton = () => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ ...skeletonStyle, height: '24px', width: '60%', marginBottom: '1rem' }} />
      <div style={{ ...skeletonStyle, height: '16px', width: '40%', marginBottom: '0.5rem' }} />
      <div style={{ ...skeletonStyle, height: '16px', width: '80%', marginBottom: '0.5rem' }} />
      <div style={{ ...skeletonStyle, height: '16px', width: '70%' }} />
    </div>
  );

  const ListSkeleton = () => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ ...skeletonStyle, height: '48px', width: '48px', borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...skeletonStyle, height: '16px', width: '50%', marginBottom: '0.5rem' }} />
        <div style={{ ...skeletonStyle, height: '14px', width: '30%' }} />
      </div>
    </div>
  );

  const TextSkeleton = () => (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ ...skeletonStyle, height: '16px', width: '100%', marginBottom: '0.5rem' }} />
      <div style={{ ...skeletonStyle, height: '16px', width: '90%', marginBottom: '0.5rem' }} />
      <div style={{ ...skeletonStyle, height: '16px', width: '80%' }} />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'text':
        return <TextSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      {Array.from({ length: count }, (_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

LoadingSkeleton.propTypes = {
  type: PropTypes.oneOf(['card', 'list', 'text']),
  count: PropTypes.number,
};

export default LoadingSkeleton;
