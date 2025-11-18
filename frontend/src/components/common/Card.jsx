import React from 'react';
import './Card.css';

function Card({ 
  children, 
  className = '', 
  hover = false, 
  interactive = false,
  variant = 'default',
  onClick 
}) {
  const classes = [
    'card',
    hover && 'card-hover',
    interactive && 'card-interactive',
    variant !== 'default' && `card-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

export default Card;

