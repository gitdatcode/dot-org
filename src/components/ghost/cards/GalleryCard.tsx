import React from 'react';

export interface GalleryCardProps {
  images?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }[];
  className?: string;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ images = [], className = '' }) => {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <figure className={`kg-card kg-gallery-card kg-width-wide ${className}`}>
      <div className="kg-gallery-container">
        <div className="kg-gallery-row">
          {images.map((image, index) => (
            <div key={index} className="kg-gallery-image">
              <img
                src={image.url}
                alt={image.alt || ''}
                width={image.width}
                height={image.height}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
};

export default GalleryCard;
