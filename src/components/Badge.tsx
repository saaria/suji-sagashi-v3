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
  const isCpuGetHighlighted = isActive && label === 'CPUget';

  // バッジのスタイル設定
  const badgeStyle = {
    backgroundColor: isCpuGetHighlighted ? '#c8ff74' : (isActive ? '#669933' : '#006633'),
    color: isCpuGetHighlighted ? '#1f3e00' : (isActive ? '#ccff33' : '#00cc33'),
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '80px',
    textAlign: 'center' as const,
    margin: '0 0.25rem'
  };

  return (
    <div style={badgeStyle}>
      {label}
    </div>
  );
}; 
