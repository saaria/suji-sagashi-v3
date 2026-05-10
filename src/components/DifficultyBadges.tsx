import React from 'react';
import { Difficulty } from '../types/gameTypes';
import { DifficultyBadge } from './DifficultyBadge';

interface DifficultyBadgesProps {
  activeDifficulty: Difficulty | null;
}

export const DifficultyBadges: React.FC<DifficultyBadgesProps> = ({
  activeDifficulty
}) => {
  // すべての難易度
  const difficulties: Difficulty[] = ['Easy', 'Normal', 'Hard', 'Hell'];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '1rem',
      marginBottom: '1rem'
    }}>
      {difficulties.map((difficulty) => (
        <DifficultyBadge
          key={difficulty}
          difficulty={difficulty}
          isActive={activeDifficulty === difficulty}
        />
      ))}
    </div>
  );
}; 