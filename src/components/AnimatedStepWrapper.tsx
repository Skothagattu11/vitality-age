import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedStepWrapperProps {
  stepKey: number;
  children: ReactNode;
}

export default function AnimatedStepWrapper({ stepKey, children }: AnimatedStepWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
