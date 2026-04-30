import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Top Navbar component
 */
const Navbar = () => {
  return (
    <nav className="hidden md:flex items-center justify-between px-md py-sm border-b border-border bg-surface sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-xs">
        <span className="font-editorial font-bold text-2xl tracking-tighter text-text-primary uppercase">Civiq</span>
      </Link>
      <div className="flex items-center gap-md font-ui text-sm">
        <Link to="/journey" className="text-text-secondary hover:text-text-primary transition-colors">My Journey</Link>
        <div className="flex gap-xs">
          <span className="h-2 w-2 rounded-full bg-primary box-shadow-glow animate-pulse"></span>
          <span className="font-bold text-primary tracking-widest uppercase text-xs">Live</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
