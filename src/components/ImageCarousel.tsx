import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  showThumbnails?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  productName, 
  className = '',
  showThumbnails = true 
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : ['/placeholder.png'];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (displayImages.length <= 1) return; // Don't handle swipes for single images
    
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endTouch = endEvent.changedTouches[0];
      const endX = endTouch.clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
      
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-md relative">
        <img
          src={displayImages[selectedImage]}
          alt={`${productName} ${selectedImage + 1}`}
          className="w-full h-full object-cover"
          onTouchStart={handleTouchStart}
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedImage === index ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Thumbnails - Only show if multiple images and showThumbnails is true */}
      {displayImages.length > 1 && showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 bg-white rounded border-2 overflow-hidden transition-colors ${
                selectedImage === index ? 'border-pink-500' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;