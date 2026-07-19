import React from 'react';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width,
            height,
            borderRadius,
            marginBottom: i !== count - 1 ? '12px' : '0'
          }}
        ></div>
      ))}
    </>
  );
}
