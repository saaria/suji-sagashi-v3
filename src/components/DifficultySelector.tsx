import React from 'react';
import { Difficulty, DIFFICULTY_SETTINGS } from '../types/gameTypes';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  disabled = false,
  compact = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty);
  };

  return (
    <div className={`difficulty-selector ${compact ? 'is-compact' : ''}`}>
      <label htmlFor="difficulty-select">難易度:</label>
      <select
        id="difficulty-select"
        value={selectedDifficulty}
        onChange={handleChange}
        disabled={disabled}
      >
        {Object.keys(DIFFICULTY_SETTINGS).map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty}
          </option>
        ))}
      </select>
    </div>
  );
}; 
