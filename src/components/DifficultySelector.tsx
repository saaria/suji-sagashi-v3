import React from 'react';
import { Difficulty, DIFFICULTY_SETTINGS } from '../types/gameTypes';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label 
        htmlFor="difficulty-select" 
        style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          color: '#000000'
        }}
      >
        難易度:
      </label>
      <select
        id="difficulty-select"
        value={selectedDifficulty}
        onChange={handleChange}
        disabled={disabled}
        style={{
          padding: '0.5rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '200px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#000000'
        }}
      >
        {Object.keys(DIFFICULTY_SETTINGS).map((difficulty) => (
          <option key={difficulty} value={difficulty}>
            {difficulty} ({DIFFICULTY_SETTINGS[difficulty as Difficulty]}秒)
          </option>
        ))}
      </select>
    </div>
  );
}; 