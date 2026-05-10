import { useCallback, useRef } from 'react';

interface GameTimers {
  startGameSequence: () => void;
  clearAllTimers: () => void;
}

export const useGameTimers = (
  onMessage: (message: string) => void,
  onCpuAction: () => void,
  maxRounds: number = 40
): GameTimers => {
  const timerRefs = useRef<{
    numberInstructions: NodeJS.Timeout | null;
    cpuWait: NodeJS.Timeout | null;
    readyInstructions: NodeJS.Timeout | null;
  }>({
    numberInstructions: null,
    cpuWait: null,
    readyInstructions: null,
  });

  const roundCountRef = useRef<number>(0);

  // タイマーをクリアする関数
  const clearAllTimers = useCallback(() => {
    Object.values(timerRefs.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
  }, []);

  // ゲームシーケンスを開始する関数
  const startGameSequence = useCallback(() => {
    roundCountRef.current = 0;
    
    // ゲームスタートメッセージを表示
    onMessage("ゲームスタート");

    // 3秒後に最初の「探す数字は...」を表示
    setTimeout(() => {
      startRound();
    }, 3000);
  }, [onMessage]);

  // 1ラウンドを開始する関数
  const startRound = useCallback(() => {
    if (roundCountRef.current >= maxRounds) {
      onMessage("ゲーム終了！");
      return;
    }

    onMessage("探す数字は...");

    // number_instructions_timer (3秒)
    timerRefs.current.numberInstructions = setTimeout(() => {
      onMessage("Nだ！");

      // cpu_wait_timer (1秒)
      timerRefs.current.cpuWait = setTimeout(() => {
        onCpuAction(); // コンソールに"cpu get"を出力

        // ready_instructions_timer (2秒)
        timerRefs.current.readyInstructions = setTimeout(() => {
          roundCountRef.current++;
          startRound(); // 次のラウンドを開始
        }, 2000);
      }, 1000);
    }, 3000);
  }, [onMessage, onCpuAction, maxRounds]);

  return {
    startGameSequence,
    clearAllTimers
  };
}; 