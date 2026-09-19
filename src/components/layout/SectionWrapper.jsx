import React from 'react';
import { motion } from 'framer-motion';

export function SectionWrapper({ id, children, className = '' }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-7xl mx-auto px-4 sm:px-8 py-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}
