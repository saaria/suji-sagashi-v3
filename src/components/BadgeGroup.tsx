import React from 'react';
import { Difficulty, DifficultyAdjustment, StatusBadge } from '../types/gameTypes';
import { Badge } from './Badge';

interface BadgeGroupProps {
  activeDifficulty: Difficulty | null;
  activeStatuses: StatusBadge[];
  title?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  activeDifficulty,
  activeStatuses,
  title
}) => {
  // すべての難易度
  const difficulties: Difficulty[] = ['Easy', 'Normal', 'Hard', 'Hell'];
  const difficultyAdjustments: DifficultyAdjustment[] = ['+1', '+2', '+3', '+4'];
  
  // すべてのステータスバッジ
  const statusBadges: StatusBadge[] = ['CPUget', 'Shorten', 'Quicken', 'Shuffle', 'Num*2', 'Hiding', 'Secret', 'Extend'];

  return (
    <div className="badge-group">
      {title && (
        <div className="badge-group-title">
          {title}
        </div>
      )}
      
      <div className="badge-row">
        {/* 難易度バッジ */}
        {difficulties.map((difficulty) => (
          <Badge
            key={difficulty}
            label={difficulty}
            isActive={activeDifficulty === difficulty}
          />
        ))}
        {difficultyAdjustments.map((adjustment) => (
          <Badge
            key={adjustment}
            label={adjustment}
            isActive={false}
          />
        ))}
      </div>
      
      <div className="badge-row">
        {/* ステータスバッジ */}
        {statusBadges.map((status) => (
          <Badge
            key={status}
            label={status}
            isActive={activeStatuses.includes(status)}
          />
        ))}
      </div>
    </div>
  );
}; 
