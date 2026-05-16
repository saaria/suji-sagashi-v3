import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { useGameSequence } from './hooks/useGameSequence';
import { NumberPanel } from './components/NumberPanel';
import { BadgeGroup } from './components/BadgeGroup';
import { CLEAR_POINT, Difficulty, StatusBadge, getCpuGameOverScore } from './types/gameTypes';

const MAX_ROUNDS = 40;
const IDLE_PANEL_NUMBERS = Array.from({ length: MAX_ROUNDS }, (_, index) => index + 1);

function App() {
  const [message, setMessage] = useState<string>('');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [scoreProgressMax, setScoreProgressMax] = useState({ player: 0, cpu: 0 });
  const logAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const gameMenuRef = useRef<HTMLDivElement | null>(null);
  const difficultyMenuRef = useRef<HTMLDivElement | null>(null);
  const helpMenuRef = useRef<HTMLDivElement | null>(null);
  const normalBgmRef = useRef<HTMLAudioElement | null>(null);
  const hardBgmRef = useRef<HTMLAudioElement | null>(null);
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
    const normalBgm = new Audio('./mdt01.mp3');
    const hardBgm = new Audio('./mdt03.mp3');
    const cpuGetSe = new Audio('./push03.wav');
    const eventSe = new Audio('./push01.wav');
    normalBgm.loop = false;
    normalBgm.preload = 'auto';
    hardBgm.loop = false;
    hardBgm.preload = 'auto';
    cpuGetSe.loop = false;
    cpuGetSe.preload = 'auto';
    eventSe.loop = false;
    eventSe.preload = 'auto';
    normalBgmRef.current = normalBgm;
    hardBgmRef.current = hardBgm;
    cpuGetSeRef.current = cpuGetSe;
    eventSeRef.current = eventSe;

    return () => {
      normalBgm.pause();
      normalBgm.currentTime = 0;
      hardBgm.pause();
      hardBgm.currentTime = 0;
      cpuGetSe.pause();
      cpuGetSe.currentTime = 0;
      eventSe.pause();
      eventSe.currentTime = 0;
      normalBgmRef.current = null;
      hardBgmRef.current = null;
      cpuGetSeRef.current = null;
      eventSeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const logArea = logAreaRef.current;
    if (!logArea) return;
    logArea.scrollTop = logArea.scrollHeight;
  }, [logMessages]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const gameMenu = gameMenuRef.current;
      const difficultyMenu = difficultyMenuRef.current;
      const helpMenu = helpMenuRef.current;
      if (!gameMenu || !difficultyMenu || !helpMenu) return;
      if (
        event.target instanceof Node &&
        !gameMenu.contains(event.target) &&
        !difficultyMenu.contains(event.target) &&
        !helpMenu.contains(event.target)
      ) {
        setIsGameMenuOpen(false);
        setIsDifficultyMenuOpen(false);
        setIsHelpMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

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
    capturedByPlayerNumbers,
    capturedByCpuNumbers,
    handlePanelClick
  } = useGameSequence({
    onMessage: handleMessage,
    onCpuAction: handleCpuAction,
    difficulty: difficulty,
    maxRounds: MAX_ROUNDS
  });

  const activeStatuses: StatusBadge[] = [
    ...(isCpuGetBoostActive ? ['CpuGet'] as const : []),
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
      activatedMessages.push('CpuGet: CPUがパネルを獲得します');
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
    setIsGameMenuOpen(false);
    setIsDifficultyMenuOpen(false);
    setIsHelpMenuOpen(false);
    setLogMessages([]);
    setActiveDifficulty(difficulty);
    const playerMax = CLEAR_POINT[difficulty];
    const cpuMax = getCpuGameOverScore(difficulty, MAX_ROUNDS);
    setScoreProgressMax({ player: playerMax, cpu: cpuMax });
    const bgm = (difficulty === 'Hard' || difficulty === 'Hell')
      ? hardBgmRef.current
      : normalBgmRef.current;
    const otherBgm = (difficulty === 'Hard' || difficulty === 'Hell')
      ? normalBgmRef.current
      : hardBgmRef.current;
    if (otherBgm) {
      otherBgm.pause();
      otherBgm.currentTime = 0;
    }
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

  const handleGameMenuToggle = useCallback(() => {
    setIsGameMenuOpen((prev) => !prev);
    setIsDifficultyMenuOpen(false);
    setIsHelpMenuOpen(false);
  }, []);

  const handleDifficultyMenuToggle = useCallback(() => {
    setIsDifficultyMenuOpen((prev) => !prev);
    setIsGameMenuOpen(false);
    setIsHelpMenuOpen(false);
  }, []);

  const handleDifficultyMenuSelect = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setIsDifficultyMenuOpen(false);
  }, []);

  const handleHelpMenuToggle = useCallback(() => {
    setIsHelpMenuOpen((prev) => !prev);
    setIsGameMenuOpen(false);
    setIsDifficultyMenuOpen(false);
  }, []);

  const handleVersionInfoClick = useCallback(() => {
    setIsHelpMenuOpen(false);
    setIsVersionModalOpen(true);
  }, []);

  const handleVersionModalClose = useCallback(() => {
    setIsVersionModalOpen(false);
  }, []);

  const handleOpenManual = useCallback(() => {
    setIsHelpMenuOpen(false);
    window.open('./manual.html', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="app-shell">
      <div className="game-window">
        <header className="app-header">
          <nav className="app-menu" aria-label="menu">
            <div className="menu-item" ref={gameMenuRef}>
              <button
                type="button"
                className="menu-button"
                onClick={handleGameMenuToggle}
                aria-expanded={isGameMenuOpen}
                aria-haspopup="menu"
              >
                ゲーム(<span>G</span>)
              </button>
              {isGameMenuOpen && (
                <div className="menu-dropdown" role="menu" aria-label="ゲームメニュー">
                  <button
                    type="button"
                    className="menu-dropdown-item"
                    role="menuitem"
                    onClick={startGame}
                    disabled={isGameRunning}
                  >
                    ゲーム開始
                  </button>
                </div>
              )}
            </div>
            <div className="menu-item" ref={difficultyMenuRef}>
              <button
                type="button"
                className="menu-button"
                onClick={handleDifficultyMenuToggle}
                aria-expanded={isDifficultyMenuOpen}
                aria-haspopup="menu"
              >
                難易度(<span>D</span>)
              </button>
              {isDifficultyMenuOpen && (
                <div className="menu-dropdown" role="menu" aria-label="難易度メニュー">
                  {(['Easy', 'Normal', 'Hard', 'Hell'] as Difficulty[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="menu-dropdown-item"
                      role="menuitemradio"
                      aria-checked={difficulty === item}
                      onClick={() => handleDifficultyMenuSelect(item)}
                      disabled={isGameRunning}
                    >
                      <span className="menu-checkmark">{difficulty === item ? '✓' : ''}</span>
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="menu-item" ref={helpMenuRef}>
              <button
                type="button"
                className="menu-button"
                onClick={handleHelpMenuToggle}
                aria-expanded={isHelpMenuOpen}
                aria-haspopup="menu"
              >
                ヘルプ(<span>H</span>)
              </button>
              {isHelpMenuOpen && (
                <div className="menu-dropdown" role="menu" aria-label="ヘルプメニュー">
                  <button
                    type="button"
                    className="menu-dropdown-item"
                    role="menuitem"
                    onClick={handleOpenManual}
                  >
                    <span>遊び方</span>
                  </button>
                  <button
                    type="button"
                    className="menu-dropdown-item"
                    role="menuitem"
                    onClick={handleVersionInfoClick}
                  >
                    <span>バージョン情報</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
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
              capturedByPlayerNumbers={capturedByPlayerNumbers}
              capturedByCpuNumbers={capturedByCpuNumbers}
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

        {isVersionModalOpen && (
          <div className="modal-overlay" role="presentation">
            <div className="modal-window" role="dialog" aria-modal="true" aria-label="バージョン情報">
              <div className="modal-header">バージョン情報</div>
              <div className="modal-content">Version: 3.0</div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={handleVersionModalClose}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 
