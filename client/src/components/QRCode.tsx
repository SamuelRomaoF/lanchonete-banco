import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

/**
 * Componente QRCode simplificado
 * Este é um placeholder que simula um QR code usando SVG
 */
const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = '#FFFFFF',
  fgColor = '#000000'
}) => {
  // Gerar um padrão simples de QR Code para representação visual
  const generatePattern = () => {
    const pattern = [];
    const cellSize = size / 25;
    
    // Células fixas de detecção nos cantos (padrão de um QR Code real)
    // Canto superior esquerdo
    pattern.push(
      <rect key="corner-tl-outer" x={cellSize} y={cellSize} width={cellSize * 7} height={cellSize * 7} fill={fgColor} />
    );
    pattern.push(
      <rect key="corner-tl-inner" x={cellSize * 2} y={cellSize * 2} width={cellSize * 5} height={cellSize * 5} fill={bgColor} />
    );
    pattern.push(
      <rect key="corner-tl-center" x={cellSize * 3} y={cellSize * 3} width={cellSize * 3} height={cellSize * 3} fill={fgColor} />
    );

    // Canto superior direito
    pattern.push(
      <rect key="corner-tr-outer" x={size - cellSize * 8} y={cellSize} width={cellSize * 7} height={cellSize * 7} fill={fgColor} />
    );
    pattern.push(
      <rect key="corner-tr-inner" x={size - cellSize * 7} y={cellSize * 2} width={cellSize * 5} height={cellSize * 5} fill={bgColor} />
    );
    pattern.push(
      <rect key="corner-tr-center" x={size - cellSize * 6} y={cellSize * 3} width={cellSize * 3} height={cellSize * 3} fill={fgColor} />
    );

    // Canto inferior esquerdo
    pattern.push(
      <rect key="corner-bl-outer" x={cellSize} y={size - cellSize * 8} width={cellSize * 7} height={cellSize * 7} fill={fgColor} />
    );
    pattern.push(
      <rect key="corner-bl-inner" x={cellSize * 2} y={size - cellSize * 7} width={cellSize * 5} height={cellSize * 5} fill={bgColor} />
    );
    pattern.push(
      <rect key="corner-bl-center" x={cellSize * 3} y={size - cellSize * 6} width={cellSize * 3} height={cellSize * 3} fill={fgColor} />
    );

    // Gerar alguns blocos aleatórios para simular o padrão do QR Code
    // Usar o valor fornecido para gerar um padrão determinístico
    const seed = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < 50; i++) {
      const randomX = Math.floor((seed * (i + 1) * 13) % 23) + 1;
      const randomY = Math.floor((seed * (i + 2) * 17) % 23) + 1;
      const randomSize = Math.floor((seed * (i + 3)) % 3) + 1;
      
      if (
        // Evitar sobrepor os cantos
        !((randomX < 8 && randomY < 8) || 
          (randomX > 16 && randomY < 8) || 
          (randomX < 8 && randomY > 16))
      ) {
        pattern.push(
          <rect 
            key={`block-${i}`} 
            x={cellSize * randomX} 
            y={cellSize * randomY} 
            width={cellSize * randomSize} 
            height={cellSize * randomSize} 
            fill={fgColor} 
          />
        );
      }
    }
    
    return pattern;
  };

  return (
    <div style={{ background: bgColor, padding: 16, display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x="0" y="0" width={size} height={size} fill={bgColor} />
        {generatePattern()}
      </svg>
      <div style={{ fontSize: '12px', textAlign: 'center', marginTop: '8px', wordBreak: 'break-all' }}>
        {value.substring(0, 20)}{value.length > 20 ? '...' : ''}
      </div>
    </div>
  );
};

export default QRCode; 