import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { useGameSequence } from './hooks/useGameSequence';
import { NumberPanel } from './components/NumberPanel';
import { DifficultySelector } from './components/DifficultySelector';
import { BadgeGroup } from './components/BadgeGroup';
import { CLEAR_POINT, Difficulty, StatusBadge, getCpuGameOverScore } from './types/gameTypes';

const MAX_ROUNDS = 40;
const IDLE_PANEL_NUMBERS = Array.from({ length: MAX_ROUNDS }, (_, index) => index + 1);

function App() {
  const [message, setMessage] = useState<string>('');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [scoreProgressMax, setScoreProgressMax] = useState({ player: 0, cpu: 0 });
  const logAreaRef = useRef<HTMLTextAreaElement | null>(null);
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

  useEffect(() => {
    const logArea = logAreaRef.current;
    if (!logArea) return;
    logArea.scrollTop = logArea.scrollHeight;
  }, [logMessages]);

  const appendLogMessage = useCallback((msg: string) => {
    setLogMessages((prev) => [...prev, msg]);
  }, []);

  const handleMessage = useCallback((msg: string) => {
    setMessage(msg);
    if (/^(CPUが)?\d+をゲットしました/.test(msg)) {
      appendLogMessage(msg);
    }
  }, [appendLogMessage]);

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
    const activatedMessages: string[] = [];

    if (!prev.shorten && isShortenActive) {
      activatedMessages.push('Shorten: CPUの待機時間が短縮されます');
    }
    if (!prev.quicken && isQuickenActive) {
      activatedMessages.push('Quicken: ゲーム進行速度が短縮されます');
    }
    if (!prev.numDouble && isNumDoubleActive) {
      activatedMessages.push('Num*2: 指示数字が2倍で表示されます');
    }
    if (!prev.extend && isExtendActive) {
      activatedMessages.push('Extend: CPUの待機時間が延長されます');
    }
    if (!prev.shuffle && isShuffleActive) {
      activatedMessages.push('Shuffle: パネルがシャッフルされます');
    }
    if (!prev.cpuGet && isCpuGetBoostActive) {
      activatedMessages.push('CPUget: CPUがパネルを獲得します');
    }
    if (!prev.hiding && isHidingActive) {
      activatedMessages.push('Hiding: パネルの数値が非表示になります');
    }
    if (!prev.secret && isSecretActive) {
      activatedMessages.push('Secret: 指示数字が不明になります');
    }

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

    if (activatedMessages.length > 0) {
      setLogMessages((prevLogs) => [...prevLogs, ...activatedMessages]);
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

  const startGame = useCallback(() => {
    setLogMessages([]);
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

  const playerProgressMax = scoreProgressMax.player || CLEAR_POINT[difficulty];
  const cpuProgressMax = scoreProgressMax.cpu || getCpuGameOverScore(difficulty, MAX_ROUNDS);
  const hasGameStarted = activeDifficulty !== null;
  const displayPanelNumbers = panelNumbers.length > 0 ? panelNumbers : IDLE_PANEL_NUMBERS;
  const isPanelTextHidden = !hasGameStarted || isHidingActive;

  return (
    <div className="app-shell">
      <div className="game-window">
        <header className="app-header">
          <nav className="app-menu" aria-label="menu">
            <span>ゲーム(G)</span>
            <span>難易度(D)</span>
            <span>ヘルプ(H)</span>
          </nav>
          <div className="header-controls">
            <DifficultySelector
              selectedDifficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              disabled={isGameRunning}
              compact
            />
            <button
              className="start-button"
              onClick={startGame}
              disabled={isGameRunning}
            >
              ゲームスタート
            </button>
          </div>
        </header>

        <main className="game-body">
          <section className="status-row">
            <div className="score-panel">
              <div className="score-name">PLAYER</div>
              <div className="score-points">{playerScore}</div>
              <progress
                className="score-progress"
                value={Math.min(playerScore, playerProgressMax)}
                max={playerProgressMax || 1}
              />
              <div className="score-meta">{playerScore}/{playerProgressMax}</div>
            </div>

            <div className={`message-window ${isGameOver ? 'is-game-over' : ''}`}>
              {message || '\u00A0'}
            </div>

            <div className="score-panel">
              <div className="score-name">CPU</div>
              <div className="score-points">{cpuScore}</div>
              <progress
                className="score-progress"
                value={Math.min(cpuScore, cpuProgressMax)}
                max={cpuProgressMax || 1}
              />
              <div className="score-meta">{cpuScore}/{cpuProgressMax}</div>
            </div>
          </section>

          <section className="numbers-row">
            <NumberPanel
              numbers={displayPanelNumbers}
              disabledNumbers={disabledPanels}
              isAllDisabled={!isGameRunning}
              isTextHidden={isPanelTextHidden}
              onPanelClick={handlePanelClick}
            />
          </section>

          <section className="badges-row">
            <BadgeGroup
              activeDifficulty={activeDifficulty}
              activeStatuses={activeStatuses}
            />
          </section>

          <section className="log-row">
            <textarea
              ref={logAreaRef}
              className="game-log"
              readOnly
              aria-label="game-log"
              value={logMessages.join('\n')}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App; 
