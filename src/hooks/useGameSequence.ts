import { useCallback, useRef, useState, useEffect } from 'react';
import { generateShuffledArray } from '../utils/arrayUtils';
import { Difficulty, DIFFICULTY_SETTINGS } from '../types/gameTypes';

interface UseGameSequenceProps {
  onMessage: (message: string) => void;
  onCpuAction: () => void;
  difficulty: Difficulty;
  maxRounds?: number;
}

const CLEAR_POINT: Record<Difficulty, number> = {
  Easy: 20,
  Normal: 23,
  Hard: 27,
  Hell: 32
};
const QUICKEN_TRIGGER_TURN = 20;
const SHORTEN_TRIGGER_TURN = 25;
const SHUFFLE_TRIGGER_TURN = 30;
const NUM_DOUBLE_TRIGGER_TURN = 33;
const SECRET_TRIGGER_TURN = 35;
const HIDING_TRIGGER_TURN = 37;
const EXTEND_TRIGGER_TURN = 5;
const EXTEND_CPU_WAIT_SECONDS = 4;
const SHORTEN_DIFFICULTY_SETTINGS: Record<Difficulty, number> = {
  Easy: 3.5,
  Normal: 2.5,
  Hard: 1.5,
  Hell: 0.75
};

export const useGameSequence = ({
  onMessage,
  onCpuAction,
  difficulty,
  maxRounds = 40
}: UseGameSequenceProps) => {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCpuGetBoostActive, setIsCpuGetBoostActive] = useState(false);
  const [isQuickenActive, setIsQuickenActive] = useState(false);
  const [isShortenActive, setIsShortenActive] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [isNumDoubleActive, setIsNumDoubleActive] = useState(false);
  const [isSecretActive, setIsSecretActive] = useState(false);
  const [isHidingActive, setIsHidingActive] = useState(false);
  const [isExtendActive, setIsExtendActive] = useState(false);
  const [numberSequence, setNumberSequence] = useState<number[]>([]);
  const [panelNumbers, setPanelNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [disabledPanels, setDisabledPanels] = useState<number[]>([]);
  // プレイヤーがクリックできるかどうかのフラグ
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  
  const roundCountRef = useRef(0);
  const hasCpuGetBoostBeenUsedRef = useRef(false);
  const hasShortenBeenUsedRef = useRef(false);
  const hasSecretBeenUsedRef = useRef(false);
  const hasHidingBeenUsedRef = useRef(false);
  const hasExtendBeenUsedRef = useRef(false);
  const isShortenActiveRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const numberSequenceRef = useRef<number[]>([]);
  // CPU処理のタイマー参照を保持
  const cpuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctSeRef = useRef<HTMLAudioElement | null>(null);
  const wrongSeRef = useRef<HTMLAudioElement | null>(null);
  
  // スコアの参照を保持
  const playerScoreRef = useRef(0);
  const cpuScoreRef = useRef(0);
  
  // スコアが変更されたら参照を更新
  useEffect(() => {
    playerScoreRef.current = playerScore;
  }, [playerScore]);
  
  useEffect(() => {
    cpuScoreRef.current = cpuScore;
  }, [cpuScore]);

  useEffect(() => {
    const correctSe = new Audio('/d_chaim.wav');
    const wrongSe = new Audio('/kan.wav');
    correctSe.loop = false;
    wrongSe.loop = false;
    correctSe.preload = 'auto';
    wrongSe.preload = 'auto';
    correctSeRef.current = correctSe;
    wrongSeRef.current = wrongSe;

    return () => {
      correctSe.pause();
      correctSe.currentTime = 0;
      wrongSe.pause();
      wrongSe.currentTime = 0;
      correctSeRef.current = null;
      wrongSeRef.current = null;
    };
  }, []);

  // ゲーム終了時の結果表示関数
  const showGameResult = useCallback(() => {
    const playerFinalScore = playerScoreRef.current;
    const cpuFinalScore = cpuScoreRef.current;
    
    if (playerFinalScore > cpuFinalScore) {
      onMessage("You Win!");
    } else if (playerFinalScore < cpuFinalScore) {
      onMessage("You Loose..");
    } else {
      onMessage("draw");
    }
  }, [onMessage]);

  useEffect(() => {
    numberSequenceRef.current = numberSequence;
  }, [numberSequence]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    
    if (cpuTimerRef.current) {
      clearTimeout(cpuTimerRef.current);
      cpuTimerRef.current = null;
    }
  }, []);

  const playSe = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch((error) => {
      console.error('効果音の再生に失敗しました:', error);
    });
  }, []);

  const shouldEndByCpuLead = useCallback((cpuCurrentScore: number) => {
    const cpuGameOverScore = maxRounds - CLEAR_POINT[difficulty] + 1;
    return cpuCurrentScore >= cpuGameOverScore;
  }, [difficulty, maxRounds]);

  const shouldActivateCpuGetBoost = useCallback((roundCount: number, playerCurrentScore: number, cpuCurrentScore: number) => {
    const currentTurn = roundCount + 1;
    return (
      !hasCpuGetBoostBeenUsedRef.current &&
      currentTurn > 5 &&
      difficulty !== 'Easy' &&
      cpuCurrentScore < playerCurrentScore
    );
  }, [difficulty]);

  const shouldActivateQuicken = useCallback((roundCount: number) => {
    const currentTurn = roundCount + 1;
    return currentTurn >= QUICKEN_TRIGGER_TURN && difficulty !== 'Easy';
  }, [difficulty]);

  const shouldActivateShorten = useCallback((roundCount: number, playerCurrentScore: number, cpuCurrentScore: number, isCpuGetBoostTurn: boolean) => {
    const currentTurn = roundCount + 1;
    return (
      !hasShortenBeenUsedRef.current &&
      !isShortenActiveRef.current &&
      !isCpuGetBoostTurn &&
      currentTurn > SHORTEN_TRIGGER_TURN &&
      cpuCurrentScore < playerCurrentScore
    );
  }, []);

  const shouldShufflePanelsThisTurn = useCallback((roundCount: number) => {
    const currentTurn = roundCount + 1;
    return currentTurn >= SHUFFLE_TRIGGER_TURN && difficulty !== 'Easy';
  }, [difficulty]);

  const shouldActivateNumDouble = useCallback((roundCount: number) => {
    const currentTurn = roundCount + 1;
    return currentTurn >= NUM_DOUBLE_TRIGGER_TURN && difficulty !== 'Easy';
  }, [difficulty]);

  const shouldActivateSecret = useCallback((roundCount: number, playerCurrentScore: number, cpuCurrentScore: number) => {
    const currentTurn = roundCount + 1;
    return (
      !hasSecretBeenUsedRef.current &&
      currentTurn > SECRET_TRIGGER_TURN &&
      difficulty !== 'Easy' &&
      cpuCurrentScore < playerCurrentScore
    );
  }, [difficulty]);

  const getNumberInstructionsTime = useCallback((isQuickenEnabled: boolean) => {
    return isQuickenEnabled ? 2000 : 3000;
  }, []);

  const getReadyInstructionsTime = useCallback((isQuickenEnabled: boolean) => {
    return isQuickenEnabled ? 1000 : 2000;
  }, []);

  const shouldActivateHiding = useCallback((roundCount: number, playerCurrentScore: number, cpuCurrentScore: number) => {
    const currentTurn = roundCount + 1;
    return (
      !hasHidingBeenUsedRef.current &&
      currentTurn > HIDING_TRIGGER_TURN &&
      difficulty !== 'Easy' &&
      cpuCurrentScore < playerCurrentScore
    );
  }, [difficulty]);

  const shouldActivateExtend = useCallback((roundCount: number, playerCurrentScore: number, cpuCurrentScore: number) => {
    const currentTurn = roundCount + 1;
    return (
      !hasExtendBeenUsedRef.current &&
      currentTurn > EXTEND_TRIGGER_TURN &&
      difficulty === 'Normal' &&
      cpuCurrentScore > playerCurrentScore
    );
  }, [difficulty]);

  const endGameByCpuLead = useCallback(() => {
    clearTimers();
    setCanPlayerClick(false);
    setIsGameRunning(false);
    setIsGameOver(true);
    onMessage("ゲームオーバー");
  }, [clearTimers, onMessage]);

  // 難易度に基づくCPU待機時間を取得
  const getCpuWaitTime = useCallback((isShortenEnabled: boolean) => {
    const waitSeconds = isShortenEnabled
      ? SHORTEN_DIFFICULTY_SETTINGS[difficulty]
      : DIFFICULTY_SETTINGS[difficulty];
    return waitSeconds * 1000; // ミリ秒に変換
  }, [difficulty]);

  // パネルクリック処理
  const handlePanelClick = useCallback((clickedNumber: number) => {
    // クリック不可の状態または実行中のゲームがない場合
    if (!canPlayerClick || !isGameRunning) return;
    
    // クリックされた数字がターゲットと一致するか確認
    if (clickedNumber === targetNumber) {
      // パネルが既に無効化されていないことを確認
      if (disabledPanels.includes(clickedNumber)) return;

      playSe(correctSeRef.current);

      // プレイヤースコア増加
      setPlayerScore(prevScore => {
        const nextScore = prevScore + 1;
        playerScoreRef.current = nextScore;
        return nextScore;
      });
      
      // パネルを無効化
      setDisabledPanels(prevDisabled => [...prevDisabled, clickedNumber]);
      
      // プレイヤーが勝ったメッセージ
      onMessage(`${clickedNumber}をゲットしました！`);
      
      // CPUのタイマーをキャンセル
      if (cpuTimerRef.current) {
        clearTimeout(cpuTimerRef.current);
        cpuTimerRef.current = null;
      }
      
      // プレイヤークリックを無効化
      setCanPlayerClick(false);
      
      const isQuickenTurn = shouldActivateQuicken(roundCountRef.current);
      const readyInstructionsTime = getReadyInstructionsTime(isQuickenTurn);

      // 次のラウンドへ進むタイマーを設定
      const nextRoundTimer = setTimeout(() => {
        const nextRoundCount = roundCountRef.current + 1;
        roundCountRef.current = nextRoundCount;
        if (shouldEndByCpuLead(cpuScoreRef.current)) {
          endGameByCpuLead();
          return;
        }
        startNextSequence();
      }, readyInstructionsTime); // ready_instructions_timer
      
      timersRef.current.push(nextRoundTimer);
      return;
    }

    // 一致しない場合は不正解音を再生
    playSe(wrongSeRef.current);
  }, [canPlayerClick, isGameRunning, targetNumber, onMessage, disabledPanels, shouldEndByCpuLead, endGameByCpuLead, shouldActivateQuicken, getReadyInstructionsTime, playSe]);

  const startNextSequence = useCallback(() => {
    if (roundCountRef.current >= maxRounds) {
      setIsGameRunning(false);
      // 勝敗判定関数を呼び出し
      showGameResult();
      return;
    }

    // 1ターン限定イベントは新ターン開始時に一旦クリアし、該当ターンで再度有効化する
    setIsCpuGetBoostActive(false);
    setIsSecretActive(false);
    setIsHidingActive(false);
    setIsExtendActive(false);

    const isQuickenTurn = shouldActivateQuicken(roundCountRef.current);
    setIsQuickenActive(isQuickenTurn);

    const isCpuGetBoostTurn = shouldActivateCpuGetBoost(
      roundCountRef.current,
      playerScoreRef.current,
      cpuScoreRef.current
    );
    if (isCpuGetBoostTurn) {
      hasCpuGetBoostBeenUsedRef.current = true;
    }
    setIsCpuGetBoostActive(isCpuGetBoostTurn);

    if (shouldActivateShorten(
      roundCountRef.current,
      playerScoreRef.current,
      cpuScoreRef.current,
      isCpuGetBoostTurn
    )) {
      hasShortenBeenUsedRef.current = true;
      isShortenActiveRef.current = true;
      setIsShortenActive(true);
    }

    const isNumDoubleTurn = shouldActivateNumDouble(roundCountRef.current);
    setIsNumDoubleActive(isNumDoubleTurn);

    const isShuffleTurn = shouldShufflePanelsThisTurn(roundCountRef.current);
    setIsShuffleActive(isShuffleTurn);

    const isSecretTurn = shouldActivateSecret(
      roundCountRef.current,
      playerScoreRef.current,
      cpuScoreRef.current
    );
    if (isSecretTurn) {
      hasSecretBeenUsedRef.current = true;
      setIsSecretActive(true);
    }

    const isHidingTurn = shouldActivateHiding(
      roundCountRef.current,
      playerScoreRef.current,
      cpuScoreRef.current
    );
    if (isHidingTurn) {
      hasHidingBeenUsedRef.current = true;
      setIsHidingActive(true);
    }

    const isExtendTurn = shouldActivateExtend(
      roundCountRef.current,
      playerScoreRef.current,
      cpuScoreRef.current
    );
    if (isExtendTurn) {
      hasExtendBeenUsedRef.current = true;
    }
    setIsExtendActive(isExtendTurn);

    // 「探す数字は...」を表示
    onMessage("探す数字は...");
    
    // プレイヤークリックを無効化
    setCanPlayerClick(false);

    const numberInstructionsTime = getNumberInstructionsTime(isQuickenTurn);

    // number_instructions_timer (3秒)
    const timer1 = setTimeout(() => {
      // 現在のラウンドに対応する「探す数値の順番配列」の値を取得
      const currentTarget = numberSequenceRef.current[roundCountRef.current];
      
      if (currentTarget !== undefined) {
        setTargetNumber(currentTarget);
        if (isSecretTurn) {
          onMessage("⁇だ！");
        } else {
          const displayTarget = isNumDoubleTurn ? currentTarget * 2 : currentTarget;
          onMessage(`${displayTarget}だ！`);
        }
        if (isShuffleTurn) {
          setPanelNumbers(generateShuffledArray(1, 40));
        }

        // CPUget補正中はプレイヤー入力を受け付けず、CPU待機時間を0にする
        setCanPlayerClick(!isCpuGetBoostTurn);
        const cpuWaitTime = isCpuGetBoostTurn
          ? 0
          : isExtendTurn
            ? EXTEND_CPU_WAIT_SECONDS * 1000
            : getCpuWaitTime(isShortenActiveRef.current);
        
        // cpu_wait_timer (難易度に応じた秒数)
        cpuTimerRef.current = setTimeout(() => {
          // プレイヤーが既にクリックしていないことを直接確認
          // disabledPanelsに現在のターゲットが含まれていなければCPUが取得する
          if (!disabledPanels.includes(currentTarget)) {
            // CPUスコアを増加
            setCpuScore(prevScore => {
              const nextScore = prevScore + 1;
              cpuScoreRef.current = nextScore;
              return nextScore;
            });
            
            // 現在のターゲット数字に対応するパネルを無効化
            setDisabledPanels(prevDisabled => [...prevDisabled, currentTarget]);
            
            // CPUのアクション
            onMessage(`CPUが${currentTarget}をゲットしました！`);
            onCpuAction();
          }

          // プレイヤークリックを無効化
          setCanPlayerClick(false);

          // ready_instructions_timer (2秒)
          const readyInstructionsTime = getReadyInstructionsTime(isQuickenTurn);
          const timer3 = setTimeout(() => {
            const nextRoundCount = roundCountRef.current + 1;
            roundCountRef.current = nextRoundCount;
            if (shouldEndByCpuLead(cpuScoreRef.current)) {
              endGameByCpuLead();
              return;
            }

            if (nextRoundCount < maxRounds) {
              if (isCpuGetBoostTurn) {
                setIsCpuGetBoostActive(false);
              }
              if (isSecretTurn) {
                setIsSecretActive(false);
              }
              if (isExtendTurn) {
                setIsExtendActive(false);
              }
            }
            startNextSequence();
          }, readyInstructionsTime);

          timersRef.current.push(timer3);
        }, cpuWaitTime); // 難易度に基づく時間

        // CPU待ちタイマーはcpuTimerRefで管理
      } else {
        console.error("ターゲット数字が取得できませんでした");
        onMessage("数字が表示できません");
      }
    }, numberInstructionsTime); // number_instructions_timer

    timersRef.current.push(timer1);
  }, [onMessage, onCpuAction, maxRounds, disabledPanels, showGameResult, getCpuWaitTime, shouldEndByCpuLead, endGameByCpuLead, shouldActivateCpuGetBoost, shouldActivateQuicken, shouldActivateShorten, shouldShufflePanelsThisTurn, shouldActivateNumDouble, shouldActivateSecret, shouldActivateHiding, shouldActivateExtend, getNumberInstructionsTime, getReadyInstructionsTime]);

  const startGame = useCallback(() => {
    clearTimers();
    roundCountRef.current = 0;
    hasCpuGetBoostBeenUsedRef.current = false;
    hasShortenBeenUsedRef.current = false;
    hasSecretBeenUsedRef.current = false;
    hasHidingBeenUsedRef.current = false;
    hasExtendBeenUsedRef.current = false;
    isShortenActiveRef.current = false;
    setIsGameOver(false);
    setIsCpuGetBoostActive(false);
    setIsQuickenActive(false);
    setIsShortenActive(false);
    setIsShuffleActive(false);
    setIsNumDoubleActive(false);
    setIsSecretActive(false);
    setIsHidingActive(false);
    setIsExtendActive(false);
    setTargetNumber(null);
    setPlayerScore(0);
    setCpuScore(0);
    playerScoreRef.current = 0;
    cpuScoreRef.current = 0;
    setDisabledPanels([]);
    setCanPlayerClick(false);
    
    // 探す数値の順番配列を生成
    const searchSequence = generateShuffledArray(1, 40);
    setNumberSequence(searchSequence);
    numberSequenceRef.current = searchSequence;
    
    // 数値パネル順番配列を生成
    const panelSequence = generateShuffledArray(1, 40);
    setPanelNumbers(panelSequence);
    
    setIsGameRunning(true);
    
    // ゲーム開始時に難易度ごとのクリアポイントを表示
    onMessage(`クリアポイント：${CLEAR_POINT[difficulty]}`);

    // 3秒後に最初のシーケンスを開始
    const initialTimer = setTimeout(() => {
      startNextSequence();
    }, 3000);

    timersRef.current.push(initialTimer);
  }, [clearTimers, startNextSequence, onMessage, difficulty]);

  // コンポーネントのアンマウント時にタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
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
    numberSequence,
    panelNumbers,
    targetNumber,
    playerScore,
    cpuScore,
    disabledPanels,
    canPlayerClick,
    handlePanelClick,
    startGame,
    clearTimers
  };
}; 
