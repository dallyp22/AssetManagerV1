import React from 'react';
import './Button.css';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'button',
    `button-${variant}`,
    `button-${size}`,
    disabled && 'button-disabled',
    loading && 'button-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="button-spinner">
          <span className="spin">⟳</span>
        </span>
      ) : children}
    </button>
  );
}

export default Button;

