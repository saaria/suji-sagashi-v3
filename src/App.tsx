import { useState, useCallback, useEffect, useRef } from 'react';
//import { Timer } from './components/Timer';
//import { useTimer } from './hooks/useTimer';
//import { useGameTimers } from './hooks/useGameTimers';
import { useGameSequence } from './hooks/useGameSequence';
import { NumberPanel } from './components/NumberPanel';
import { DifficultySelector } from './components/DifficultySelector';
import { BadgeGroup } from './components/BadgeGroup';
import { CLEAR_POINT, Difficulty, StatusBadge, getCpuGameOverScore } from './types/gameTypes';

const MAX_ROUNDS = 40;

function App() {
  // メッセージを表示する状態
  const [message, setMessage] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [scoreProgressMax, setScoreProgressMax] = useState({ player: 0, cpu: 0 });
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const cpuGetSeRef = useRef<HTMLAudioElement | null>(null);
  const eventSeRef = useRef<HTMLAudioElement | null>(null);
  const prevStatusRef = useRef({
    cpuGet: false,
    shorten: false,
    quicken: false,
    shuffle: false,
    numDouble: false,
    hiding: false,
    secret: false,
    extend: false
  });

  useEffect(() => {
    const bgm = new Audio('/mdt01.mp3');
    const cpuGetSe = new Audio('/push03.wav');
    const eventSe = new Audio('/push01.wav');
    bgm.loop = false;
    bgm.preload = 'auto';
    cpuGetSe.loop = false;
    cpuGetSe.preload = 'auto';
    eventSe.loop = false;
    eventSe.preload = 'auto';
    bgmRef.current = bgm;
    cpuGetSeRef.current = cpuGetSe;
    eventSeRef.current = eventSe;

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
      cpuGetSe.pause();
      cpuGetSe.currentTime = 0;
      eventSe.pause();
      eventSe.currentTime = 0;
      bgmRef.current = null;
      cpuGetSeRef.current = null;
      eventSeRef.current = null;
    };
  }, []);

  const handleMessage = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const handleCpuAction = useCallback(() => {
    const cpuGetSe = cpuGetSeRef.current;
    if (!cpuGetSe) return;
    cpuGetSe.pause();
    cpuGetSe.currentTime = 0;
    void cpuGetSe.play().catch((error) => {
      console.error('CPU効果音の再生に失敗しました:', error);
    });
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
    maxRounds: MAX_ROUNDS
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

  useEffect(() => {
    const prev = prevStatusRef.current;
    const activated =
      (!prev.cpuGet && isCpuGetBoostActive) ||
      (!prev.shorten && isShortenActive) ||
      (!prev.quicken && isQuickenActive) ||
      (!prev.shuffle && isShuffleActive) ||
      (!prev.numDouble && isNumDoubleActive) ||
      (!prev.hiding && isHidingActive) ||
      (!prev.secret && isSecretActive) ||
      (!prev.extend && isExtendActive);

    if (activated) {
      const eventSe = eventSeRef.current;
      if (eventSe) {
        eventSe.pause();
        eventSe.currentTime = 0;
        void eventSe.play().catch((error) => {
          console.error('イベント効果音の再生に失敗しました:', error);
        });
      }
    }

    prevStatusRef.current = {
      cpuGet: isCpuGetBoostActive,
      shorten: isShortenActive,
      quicken: isQuickenActive,
      shuffle: isShuffleActive,
      numDouble: isNumDoubleActive,
      hiding: isHidingActive,
      secret: isSecretActive,
      extend: isExtendActive
    };
  }, [
    isCpuGetBoostActive,
    isShortenActive,
    isQuickenActive,
    isShuffleActive,
    isNumDoubleActive,
    isHidingActive,
    isSecretActive,
    isExtendActive
  ]);

  // ゲームスタート時にアクティブな難易度をセット
  const startGame = useCallback(() => {
    setActiveDifficulty(difficulty);
    const playerMax = CLEAR_POINT[difficulty];
    const cpuMax = getCpuGameOverScore(difficulty, MAX_ROUNDS);
    setScoreProgressMax({ player: playerMax, cpu: cpuMax });
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
          {activeDifficulty && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
              color: '#000000'
            }}>
              <div style={{ minWidth: '260px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Player Progress: {playerScore}/{scoreProgressMax.player}
                </div>
                <progress
                  value={Math.min(playerScore, scoreProgressMax.player)}
                  max={scoreProgressMax.player || 1}
                  style={{ width: '100%', height: '1rem' }}
                />
              </div>
              <div style={{ minWidth: '260px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  CPU Progress: {cpuScore}/{scoreProgressMax.cpu}
                </div>
                <progress
                  value={Math.min(cpuScore, scoreProgressMax.cpu)}
                  max={scoreProgressMax.cpu || 1}
                  style={{ width: '100%', height: '1rem' }}
                />
              </div>
            </div>
          )}
          
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
