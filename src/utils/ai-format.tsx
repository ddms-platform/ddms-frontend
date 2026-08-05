import React from 'react';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const formatMessageText = (rawText: string): React.ReactNode[] => {
  const cleaned = rawText.replace(/\[ID:\s*[a-f0-9-]+\]/gi, '').trim();
  const parts = cleaned.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={index}
          className="font-bold text-cyan-600 dark:text-cyan-300"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};
