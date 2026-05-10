import React from 'react';
import { BadgeType } from '../types/gameTypes';

interface BadgeProps {
  label: BadgeType;
  isActive: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  isActive
}) => {
  // バッジのスタイル設定
  const badgeStyle = {
    backgroundColor: isActive ? '#669933' : '#006633',
    color: isActive ? '#ccff33' : '#00cc33',
    padding: '0.25rem 0.25rem',
    borderRadius: '0.375rem',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '80px',
    textAlign: 'center' as const,
    margin: '0.25rem'
  };

  return (
    <div style={badgeStyle}>
      {label}
    </div>
  );
}; 
