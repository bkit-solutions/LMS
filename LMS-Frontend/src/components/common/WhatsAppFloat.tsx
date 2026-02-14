import React from "react";
import { useLocation } from "react-router-dom";

const WhatsAppFloat: React.FC = () => {
  const location = useLocation();

  // Show ONLY on landing page
  if (location.pathname !== "/") return null;

  return (
    <a
      href="https://wa.me/918121034516?text=Hello%20BKIT%20Solutions%0A%0AI%E2%80%99m%20interested%20in%20your%20LMS%20platform.%20Please%20share%20more%20details."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with BKIT LMS on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-8 right-8 z-[9999] flex items-center justify-center
                 w-14 h-14 rounded-full shadow-2xl transition-all duration-300
                 hover:scale-110"
     
    >
       <img
    src="https://img.icons8.com/color/96/000000/whatsapp--v1.png"
    alt="WhatsApp Chat"
  />
    </a>
  );
};

export default WhatsAppFloat;
