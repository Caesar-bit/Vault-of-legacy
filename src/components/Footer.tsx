import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white/80 border-t border-gray-200 text-gray-500 text-sm text-center py-4 backdrop-blur-md">
      © {new Date().getFullYear()} Vault of Legacy. All rights reserved.
    </footer>
  );
}
