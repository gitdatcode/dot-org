import React, { useState } from 'react';

export interface ToggleCardProps {
  heading?: string;
  html?: string;
  className?: string;
}

const ToggleCard: React.FC<ToggleCardProps> = ({
  heading = 'Toggle header',
  html,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`kg-card kg-toggle-card ${className}`}
      data-kg-toggle-state={isOpen ? 'open' : 'close'}
    >
      <div className="kg-toggle-heading">
        <h4 className="kg-toggle-heading-text">
          <span style={{ whiteSpace: 'pre-wrap' }}>{heading}</span>
        </h4>
        <button
          className="kg-toggle-card-icon"
          aria-label={isOpen ? 'Collapse toggle to hide content' : 'Expand toggle to read content'}
          onClick={toggleOpen}
        >
          <svg id="Regular" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path className="cls-1" d="M23.25,7.311,12.53,18.03a.749.749,0,0,1-1.06,0L.75,7.311"></path>
          </svg>
        </button>
      </div>
      <div className="kg-toggle-content" style={{ display: isOpen ? 'block' : 'none' }}>
        <div dangerouslySetInnerHTML={{ __html: html || '' }} />
      </div>
    </div>
  );
};

export default ToggleCard;
