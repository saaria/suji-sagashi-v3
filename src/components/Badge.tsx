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
  return (
    <div className={`status-badge ${isActive ? 'is-active' : ''}`}>
      {label}
    </div>
  );
}; 
