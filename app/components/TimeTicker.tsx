import { AnimatePresence, motion } from "framer-motion";

const TimeTicker = ({ value }: { value: number }) => {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex justify-center items-center text-gray-600 dark:text-gray-400">
      <div className="flex items-baseline">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={minutes}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="tabular-nums"
          >
            {formatNumber(minutes)}
          </motion.span>
        </AnimatePresence>
        <span className="mx-1">:</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={seconds}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="tabular-nums"
          >
            {formatNumber(seconds)}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimeTicker;