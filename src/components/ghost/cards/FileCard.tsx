import React from 'react';

export interface FileCardProps {
  url: string;
  title?: string;
  caption?: string;
  fileName?: string;
  fileSize?: string;
  className?: string;
}

const FileCard: React.FC<FileCardProps> = ({
  url,
  title,
  caption,
  fileName,
  fileSize,
  className = '',
}) => {
  if (!url) {
    return null;
  }

  return (
    <div className={`kg-card kg-file-card ${className}`}>
      <a className="kg-file-card-container" href={url} title="Download" download>
        <div className="kg-file-card-contents">
          {title && <div className="kg-file-card-title">{title}</div>}
          {caption && <div className="kg-file-card-caption">{caption}</div>}
          <div className="kg-file-card-metadata">
            {fileName && <div className="kg-file-card-filename">{fileName}</div>}
            {fileSize && <div className="kg-file-card-filesize">{fileSize}</div>}
          </div>
        </div>
        <div className="kg-file-card-icon">
          <svg viewBox="0 0 24 24">
            <defs>
              <style>
                {`
                  .a {
                    fill: none;
                    stroke: currentColor;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-width: 1.5px;
                  }
                `}
              </style>
            </defs>
            <title>download-circle</title>
            <polyline className="a" points="8.25 14.25 12 18 15.75 14.25"></polyline>
            <line className="a" x1="12" y1="6.75" x2="12" y2="18"></line>
            <circle className="a" cx="12" cy="12" r="11.25"></circle>
          </svg>
        </div>
      </a>
    </div>
  );
};

export default FileCard;
