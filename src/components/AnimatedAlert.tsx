import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export interface AnimatedAlertProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

export function AnimatedAlert({ message, type, onClose }: AnimatedAlertProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const Icon = type === 'success' ? Check : X;
  const circleColor = type === 'success' ? 'bg-success-500' : 'bg-error-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-5 right-5 z-50 flex items-center space-x-3 bg-white/90 backdrop-blur-lg border border-gray-200 shadow-xl px-4 py-2 rounded-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex items-center justify-center h-8 w-8 rounded-full text-white ${circleColor}`}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <span className="text-sm font-medium text-gray-900">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
