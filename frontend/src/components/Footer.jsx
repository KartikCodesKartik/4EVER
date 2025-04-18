import React from 'react';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom';

const Footer = () => {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This makes the scroll smooth
    });
  };

  return (
    <div className="bg-gray-100 py-10 mt-40">
      <div className="container mx-auto px-4 sm:grid grid-cols-[3fr_1fr_1fr] gap-14 text-sm">
        {/* First Section */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis nobis quam quia molestias dolorum dicta, voluptate dolor officiis ab magni facere quaerat tenetur, sequi fuga.
          </p>
        </div>

        {/* Second Section - Company Links */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <NavLink to="/" onClick={scrollToTop} className="hover:text-blue-500">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={scrollToTop} className="hover:text-blue-500">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/delivery" onClick={scrollToTop} className="hover:text-blue-500">Delivery</NavLink>
            </li>
            <li>
              <NavLink to="/privacy-policy" onClick={scrollToTop} className="hover:text-blue-500">Privacy Policy</NavLink>
            </li>
          </ul>
        </div>

        {/* Third Section - Contact */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+1-212-456-7890</li>
            <li>info@company.com</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t mt-10 pt-5 text-center">
        <p className="text-sm text-gray-600">Copyright 2024 @ forever.com - All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
