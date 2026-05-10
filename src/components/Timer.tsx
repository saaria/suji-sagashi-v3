import React from 'react';

interface TimerProps {
  label: string;
  seconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  label,
  seconds,
  isRunning,
  onStart,
  onPause,
  onReset,
}) => {
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-64">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{label}</h2>
      <div className="text-3xl font-mono text-center my-4">
        {formatTime(seconds)}
      </div>
      <div className="flex justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            開始
          </button>
        ) : (
          <button
            onClick={onPause}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            一時停止
          </button>
        )}
        <button
          onClick={onReset}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          リセット
        </button>
      </div>
    </div>
  );
}; 