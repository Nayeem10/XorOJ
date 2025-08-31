import React from 'react';
import "../styles.css";  // Import global styles (including theme colors)

const Footer = () => {
  return (
   <footer className="footer p-4">
      <div className="container flex justify-center mx-auto">
        <p>&copy; {new Date().getFullYear()} XorOJ. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
