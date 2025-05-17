"use client";

import React from 'react';
import { QueueList } from './QueueList';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueueSidebar({ isOpen, onClose }: QueueSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="h-full w-80 bg-background border-l border-border shadow-lg flex flex-col z-40"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Queue</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="Close queue"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <QueueList />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
} 