import React from 'react';

const Footer = () => {
  return (
   <footer className="footer p-4 bg-base-200">
      <div className="container flex justify-center mx-auto">
        <p>&copy; {new Date().getFullYear()} XorOJ. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
