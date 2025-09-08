import React from 'react';

export interface HeaderCardProps {
  heading?: string;
  subheading?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
}

const HeaderCard: React.FC<HeaderCardProps> = ({
  heading,
  subheading,
  backgroundColor = '#000000',
  textColor = '#FFFFFF',
  alignment = 'center',
  className = '',
}) => {
  return (
    <div
      className={`kg-card kg-header-card kg-v2 kg-width-full kg-content-wide ${className}`}
      style={{ backgroundColor }}
      data-background-color={backgroundColor}
    >
      <div className="kg-header-card-content">
        <div className={`kg-header-card-text kg-align-${alignment}`}>
          {heading && (
            <h2
              id={heading.toLowerCase().replace(/\s+/g, '-')}
              className="kg-header-card-heading"
              style={{ color: textColor }}
              data-text-color={textColor}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>{heading}</span>
            </h2>
          )}
          {subheading && (
            <p
              id={subheading.toLowerCase().replace(/\s+/g, '-')}
              className="kg-header-card-subheading"
              style={{ color: textColor }}
              data-text-color={textColor}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>{subheading}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderCard;
