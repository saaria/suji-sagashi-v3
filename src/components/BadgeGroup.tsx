import React from 'react';
import { Difficulty, StatusBadge } from '../types/gameTypes';
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
  
  // すべてのステータスバッジ
  const statusBadges: StatusBadge[] = ['CPUget', 'Shorten', 'Question', 'Unknown', 'Shuffle'];

  return (
    <div style={{ marginBottom: '1rem' }}>
      {title && (
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          color: '#000000',
          textAlign: 'center'
        }}>
          {title}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {/* 難易度バッジ */}
        {difficulties.map((difficulty) => (
          <Badge
            key={difficulty}
            label={difficulty}
            isActive={activeDifficulty === difficulty}
          />
        ))}
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
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