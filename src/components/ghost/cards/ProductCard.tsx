import React from 'react';

export interface ProductCardProps {
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  buttonText?: string;
  buttonUrl?: string;
  rating?: number;
  starColor?: string;
  backgroundColor?: string;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  image,
  imageWidth,
  imageHeight,
  buttonText = 'Buy now',
  buttonUrl = '#',
  rating = 0,
  starColor = 'currentColor',
  backgroundColor,
  className = '',
}) => {
  // Generate stars based on rating (1-5)
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`kg-product-card-rating-${i < rating ? 'active' : 'inactive'} kg-product-card-rating-star`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={starColor}>
        <path d="M12.729,1.2l3.346,6.629,6.44.638a.805.805,0,0,1,.5,1.374l-5.3,5.253,1.965,7.138a.813.813,0,0,1-1.151.935L12,19.934,5.48,23.163a.813.813,0,0,1-1.151-.935L6.294,15.09.99,9.837a.805.805,0,0,1,.5-1.374l6.44-.638L11.271,1.2A.819.819,0,0,1,12.729,1.2Z"></path>
      </svg>
    </span>
  ));

  return (
    <div className={`kg-card kg-product-card ${className}`} style={{ backgroundColor }}>
      <div className="kg-product-card-container">
        {image && (
          <img
            src={image}
            width={imageWidth}
            height={imageHeight}
            className="kg-product-card-image"
            loading="lazy"
            alt={title || 'Product'}
          />
        )}
        <div className="kg-product-card-title-container">
          {title && <h4 className="kg-product-card-title">{title}</h4>}
        </div>

        {rating > 0 && <div className="kg-product-card-rating">{stars}</div>}

        {description && <div className="kg-product-card-description">{description}</div>}

        <a href={buttonUrl} className="kg-product-card-button kg-product-card-btn-accent" target="_blank" rel="noopener noreferrer">
          <span>{buttonText}</span>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
