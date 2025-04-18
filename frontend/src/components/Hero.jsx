import React from 'react';
import Slider from 'react-slick'; // Import Slick Slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


// Define the image URLs
const imageUrls = [
  'https://res.cloudinary.com/dbif40ghf/image/upload/v1744896369/image_21_erxrm1.png',
  'https://res.cloudinary.com/dbif40ghf/image/upload/v1744896368/image_22_ddgcql.png',
  'https://res.cloudinary.com/dbif40ghf/image/upload/v1744896369/image_23_avcsij.png',
  'https://res.cloudinary.com/dbif40ghf/image/upload/v1744896369/image_24_ywqczt.png',
];

const Hero = () => {
  // Slick Slider settings
  const settings = {
    infinite: true, // Allows continuous sliding
    speed: 500, // Transition speed (ms)
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Auto slide
    autoplaySpeed: 3000, // Change every 3 seconds
    arrows: false, // Hide navigation arrows
    dots: true, // Show dots for navigation
  };

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
      {/* Hero Left Side */}
      <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
        <div className='text-[#414141]'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
          </div>
          <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>
            Latest Arrivals
          </h1>
          <div className='flex items-center gap-2'>
            <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
            <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
          </div>
        </div>
      </div>

      {/* Hero Right Side - Slick Slider */}
      <div className='w-full sm:w-1/2'>
        <Slider {...settings}>
          {imageUrls.map((imageUrl, index) => (
            <div key={index}>
              <img className='w-full' src={imageUrl} alt={`Hero Image ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Hero;
