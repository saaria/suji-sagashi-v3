import { useState, useCallback, useEffect, useRef } from 'react';
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
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgm = new Audio('/mdt01.mp3');
    bgm.loop = false;
    bgm.preload = 'auto';
    bgmRef.current = bgm;

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
      bgmRef.current = null;
    };
  }, []);

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
    isCpuGetBoostActive,
    isQuickenActive,
    isShortenActive,
    isShuffleActive,
    isNumDoubleActive,
    isSecretActive,
    isHidingActive,
    isExtendActive,
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

  const activeStatuses: StatusBadge[] = [
    ...(isCpuGetBoostActive ? ['CPUget'] as const : []),
    ...(isQuickenActive ? ['Quicken'] as const : []),
    ...(isShortenActive ? ['Shorten'] as const : []),
    ...(isShuffleActive ? ['Shuffle'] as const : []),
    ...(isNumDoubleActive ? ['Num*2'] as const : []),
    ...(isSecretActive ? ['Secret'] as const : []),
    ...(isHidingActive ? ['Hiding'] as const : []),
    ...(isExtendActive ? ['Extend'] as const : [])
  ];

  // ゲームスタート時にアクティブな難易度をセット
  const startGame = useCallback(() => {
    setActiveDifficulty(difficulty);
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      void bgm.play().catch((error) => {
        console.error('BGMの再生に失敗しました:', error);
      });
    }
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
          isTextHidden={isHidingActive}
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
