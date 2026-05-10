interface NumberPanelProps {
  numbers: number[];
  disabledNumbers: number[];
  isAllDisabled?: boolean;
  onPanelClick?: (number: number) => void;
}

export const NumberPanel: React.FC<NumberPanelProps> = ({ 
  numbers,
  disabledNumbers,
  isAllDisabled = false,
  onPanelClick 
}) => {
  // スタイルを直接指定
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)', // 8列
    gridTemplateRows: 'repeat(5, 1fr)',    // 5行
    gap: '8px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const buttonBaseStyle = {
    aspectRatio: '1/1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={containerStyle}>
      {numbers.map((number, index) => {
        const isDisabled = isAllDisabled || disabledNumbers.includes(number);
        
        // ボタンのスタイルを動的に決定
        const buttonStyle = {
          ...buttonBaseStyle,
          backgroundColor: isDisabled ? '#d1d5db' : 'white',
          borderColor: isDisabled ? '#9ca3af' : '#d1d5db',
          color: isDisabled ? '#6b7280' : '#000000',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        };
        
        return (
          <button
            key={index}
            onClick={() => !isDisabled && onPanelClick?.(number)}
            disabled={isDisabled}
            style={buttonStyle}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
}; 
