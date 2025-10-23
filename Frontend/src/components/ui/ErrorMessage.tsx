
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorMessageProps {
  message: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
