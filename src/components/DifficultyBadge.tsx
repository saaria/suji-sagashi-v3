import React from 'react';
import { Difficulty } from '../types/gameTypes';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  isActive: boolean;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  isActive
}) => {
  // バッジのスタイル設定
  const badgeStyle = {
    backgroundColor: isActive ? '#669933' : '#006633',
    color: isActive ? '#ccff33' : '#00cc33',
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
      {difficulty}
    </div>
  );
}; 