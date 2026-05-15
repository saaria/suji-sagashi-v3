interface NumberPanelProps {
  numbers: number[];
  disabledNumbers: number[];
  isAllDisabled?: boolean;
  isTextHidden?: boolean;
  onPanelClick?: (number: number) => void;
}

export const NumberPanel: React.FC<NumberPanelProps> = ({ 
  numbers,
  disabledNumbers,
  isAllDisabled = false,
  isTextHidden = false,
  onPanelClick 
}) => {
  return (
    <div className="number-panel">
      {numbers.map((number, index) => {
        const isDisabled = isAllDisabled || disabledNumbers.includes(number);

        return (
          <button
            key={index}
            onClick={() => !isDisabled && onPanelClick?.(number)}
            disabled={isDisabled}
            className={`number-cell ${isDisabled ? 'is-disabled' : ''}`}
            aria-label={`panel-${number}`}
          >
            {isTextHidden ? '' : number}
          </button>
        );
      })}
    </div>
  );
}; 
