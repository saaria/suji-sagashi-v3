interface NumberPanelProps {
  numbers: number[];
  disabledNumbers: number[];
  capturedByPlayerNumbers?: number[];
  capturedByCpuNumbers?: number[];
  isAllDisabled?: boolean;
  isTextHidden?: boolean;
  onPanelClick?: (number: number) => void;
}

export const NumberPanel: React.FC<NumberPanelProps> = ({ 
  numbers,
  disabledNumbers,
  capturedByPlayerNumbers = [],
  capturedByCpuNumbers = [],
  isAllDisabled = false,
  isTextHidden = false,
  onPanelClick 
}) => {
  return (
    <div className="number-panel">
      {numbers.map((number, index) => {
        const isDisabled = isAllDisabled || disabledNumbers.includes(number);
        const isCapturedByPlayer = capturedByPlayerNumbers.includes(number);
        const isCapturedByCpu = capturedByCpuNumbers.includes(number);
        const shouldHideDisabledText = isDisabled && !isCapturedByPlayer && !isCapturedByCpu;

        const classNames = [
          'number-cell',
          isDisabled ? 'is-disabled' : '',
          shouldHideDisabledText ? 'is-disabled-hidden' : '',
          isCapturedByPlayer ? 'is-captured-player' : '',
          isCapturedByCpu ? 'is-captured-cpu' : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={index}
            onClick={() => !isDisabled && onPanelClick?.(number)}
            disabled={isDisabled}
            className={classNames}
            aria-label={`panel-${number}`}
          >
            {isTextHidden ? '' : number}
          </button>
        );
      })}
    </div>
  );
}; 
