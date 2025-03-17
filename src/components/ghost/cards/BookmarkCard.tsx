import React from 'react';

export interface BookmarkCardProps {
  url: string;
  title?: string;
  description?: string;
  author?: string;
  publisher?: string;
  thumbnail?: string;
  icon?: string;
  className?: string;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  url,
  title,
  description,
  author,
  publisher,
  thumbnail,
  icon,
  className = '',
}) => {
  if (!url) {
    return null;
  }

  return (
    <figure className={`kg-card kg-bookmark-card ${className}`}>
      <a className="kg-bookmark-container" href={url}>
        <div className="kg-bookmark-content">
          {title && <div className="kg-bookmark-title">{title}</div>}
          {description && <div className="kg-bookmark-description">{description}</div>}
          <div className="kg-bookmark-metadata">
            {icon && <img className="kg-bookmark-icon" src={icon} alt="" />}
            {author && <span className="kg-bookmark-author">{author}</span>}
            {publisher && <span className="kg-bookmark-publisher">{publisher}</span>}
          </div>
        </div>
        {thumbnail && (
          <div className="kg-bookmark-thumbnail">
            <img src={thumbnail} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        )}
      </a>
    </figure>
  );
};

export default BookmarkCard;
