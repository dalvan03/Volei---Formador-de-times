import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Fraco',
  2: 'Regular',
  3: 'Bom',
  4: 'Muito Bom',
  5: 'Excelente',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showLabel = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const isFilled = star <= Math.round(value);
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange && onChange(star)}
              className={`${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95 transition-transform'
              } focus:outline-none p-0.5`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-300 fill-slate-100'
                } transition-colors`}
              />
            </button>
          );
        })}
        {showLabel && value > 0 && (
          <span className="ml-2 text-xs font-semibold text-slate-600">
            {RATING_LABELS[value] || `${value.toFixed(1)}`}
          </span>
        )}
        {showLabel && value === 0 && (
          <span className="ml-2 text-xs font-semibold text-amber-600">
            Avalie
          </span>
        )}
      </div>
    </div>
  );
};
