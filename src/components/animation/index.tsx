import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

type CollapseProps = {
  children: ReactNode;
  isOpen?: boolean;
  duration?: number;
  className?: string;
};

const Animation = ({ children, isOpen = true, duration = 0.3, className = "" }: CollapseProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Animation;
