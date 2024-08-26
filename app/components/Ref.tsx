import { useEffect, useRef, useState } from 'react';
import { formatTime } from '../utils/time';

interface RefProps {
  email: string;
  onOpen: () => void;
  onClose: () => void;
}

export default function Ref({ email, onOpen, onClose }: RefProps) {
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    const startTimer = () => {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const timeElapsed = currentTime - startTime;
        const newRemainingTime = Math.max(0, 300000 - timeElapsed);
        setRemainingTime(newRemainingTime);
      }, 1000);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4">
      <h2 className="text-xl font-semibold">Disposable email for your temporary needs</h2>
      <div className="text-sm text-gray-500">
        Time remaining: {formatTime(remainingTime)}
      </div>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              className="input input-bordered w-full"
              disabled
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpen}
            >
              Open
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="email"
              value={email}
              className="input input-bordered w-full"
              disabled
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}