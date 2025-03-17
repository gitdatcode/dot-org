import React from 'react';

export interface ButtonCardProps {
  buttonText?: string;
  buttonUrl?: string;
  alignment?: 'left' | 'center' | 'right';
  buttonColor?: string;
  buttonTextColor?: string;
  className?: string;
}

const ButtonCard: React.FC<ButtonCardProps> = ({
  buttonText = 'Learn more',
  buttonUrl = '#',
  alignment = 'center',
  buttonColor,
  buttonTextColor,
  className = '',
}) => {
  return (
    <div className={`kg-card kg-button-card kg-align-${alignment} ${className}`}>
      <a
        href={buttonUrl}
        className="kg-btn kg-btn-accent"
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor
        }}
      >
        {buttonText}
      </a>
    </div>
  );
};

export default ButtonCard;
