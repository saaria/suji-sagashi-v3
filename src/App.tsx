import { useState, useCallback } from 'react';
//import { Timer } from './components/Timer';
//import { useTimer } from './hooks/useTimer';
//import { useGameTimers } from './hooks/useGameTimers';
import { useGameSequence } from './hooks/useGameSequence';
import { NumberPanel } from './components/NumberPanel';
import { DifficultySelector } from './components/DifficultySelector';
import { BadgeGroup } from './components/BadgeGroup';
import { Difficulty, StatusBadge } from './types/gameTypes';

function App() {
  // メッセージを表示する状態
  const [message, setMessage] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  // アクティブなステータスバッジを管理する状態
  const [activeStatuses, setActiveStatuses] = useState<StatusBadge[]>([]);

  const handleMessage = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const handleCpuAction = useCallback(() => {
    console.log("cpu get");
  }, []);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  const { 
    startGame: originalStartGame, 
    isGameRunning, 
    isGameOver,
    panelNumbers, 
    playerScore,
    cpuScore,
    disabledPanels,
    canPlayerClick,
    handlePanelClick
  } = useGameSequence({
    onMessage: handleMessage,
    onCpuAction: handleCpuAction,
    difficulty: difficulty,
    maxRounds: 40
  });

  // ゲームスタート時にアクティブな難易度をセット
  const startGame = useCallback(() => {
    setActiveDifficulty(difficulty);
    // ゲーム開始時にステータスバッジはリセット
    setActiveStatuses([]);
    originalStartGame();
  }, [difficulty, originalStartGame]);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            minHeight: '2rem',
            color: '#000000'
          }}>
            {message}
          </div>
          
          {/* スコア表示 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem',
            marginBottom: '1rem',
            color: '#000000'
          }}>
            <div style={{ fontSize: '1.125rem' }}>
              プレイヤー: <span style={{ fontWeight: 'bold' }}>{playerScore}</span>
            </div>
            <div style={{ fontSize: '1.125rem' }}>
              CPU: <span style={{ fontWeight: 'bold' }}>{cpuScore}</span>
            </div>
          </div>
          
          {/* 難易度選択 */}
          <div style={{ maxWidth: '300px', margin: '0 auto', marginBottom: '1rem' }}>
            <DifficultySelector
              selectedDifficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              disabled={isGameRunning}
            />
          </div>
          
          <button 
            onClick={startGame}
            disabled={isGameRunning}
            style={{
              backgroundColor: isGameRunning ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: isGameRunning ? 'not-allowed' : 'pointer'
            }}
          >
            ゲームスタート
          </button>
        </div>

        {/* ゲームの状態表示 */}
        {(isGameRunning || isGameOver) && (
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: isGameOver ? '#fecaca' : (canPlayerClick ? '#dcfce7' : '#fee2e2'),
            borderRadius: '0.375rem',
            color: '#000000'
          }}>
            {isGameOver
              ? 'ゲームオーバー'
              : (canPlayerClick 
              ? '今すぐクリックしてください！' 
              : 'お待ちください...')}
          </div>
        )}

        {/* 数値パネルの表示 */}
        <NumberPanel 
          numbers={panelNumbers} 
          disabledNumbers={disabledPanels}
          isAllDisabled={!isGameRunning}
          onPanelClick={handlePanelClick}
        />
        
        {/* バッジグループ */}
        <div style={{ marginTop: '1.5rem' }}>
          <BadgeGroup 
            title="ゲームステータス"
            activeDifficulty={activeDifficulty}
            activeStatuses={activeStatuses}
          />
        </div>
      </div>
    </div>
  );
}

export default App; 
