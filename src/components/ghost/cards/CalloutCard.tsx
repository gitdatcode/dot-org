import React from 'react';

export interface CalloutCardProps {
  html?: string;
  emoji?: string;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

const CalloutCard: React.FC<CalloutCardProps> = ({
  html,
  emoji = '💡',
  backgroundColor,
  textColor,
  className = '',
}) => {
  // Determine the color class based on backgroundColor
  let colorClass = '';
  if (backgroundColor) {
    if (backgroundColor.includes('blue')) colorClass = 'kg-callout-card-blue';
    else if (backgroundColor.includes('green')) colorClass = 'kg-callout-card-green';
    else if (backgroundColor.includes('yellow')) colorClass = 'kg-callout-card-yellow';
    else if (backgroundColor.includes('red')) colorClass = 'kg-callout-card-red';
    else if (backgroundColor.includes('pink')) colorClass = 'kg-callout-card-pink';
    else if (backgroundColor.includes('purple')) colorClass = 'kg-callout-card-purple';
  }

  return (
    <div
      className={`kg-card kg-callout-card ${colorClass} ${className}`}
      style={{
        backgroundColor: !colorClass ? backgroundColor : undefined,
        color: textColor
      }}
    >
      <div className="kg-callout-emoji">{emoji}</div>
      <div
        className="kg-callout-text"
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    </div>
  );
};

export default CalloutCard;
