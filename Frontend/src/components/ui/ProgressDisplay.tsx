
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';

interface ProgressDisplayProps {
  percentage: number;
  text: string;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ percentage, text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-6 text-center"
    >
      <Spinner className="mx-auto mb-4" />
      <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
        </motion.div>
      </div>
       <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </motion.div>
  );
};
