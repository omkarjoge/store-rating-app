import React, { useState } from 'react';

// value: current rating (0-5). onChange(n): called when a star is clicked (interactive mode).
// readOnly: renders static stars, no interaction.
export default function StarRating({ value = 0, onChange, readOnly = false, size }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <span className={`stars ${readOnly ? 'readonly' : ''}`} style={size ? { fontSize: size } : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= display ? 'filled' : ''}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange && onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
