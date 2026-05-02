import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import type { QueryData } from '../App';

interface InitialResponseScreenProps {
  queryData: QueryData;
  initialResult: string | null;
  isDetailedAnalysisReady: boolean;
  onContinue: () => void;
  onBack: () => void;
}

export default function InitialResponseScreen({ 
  queryData, 
  initialResult,
  isDetailedAnalysisReady,
  onContinue, 
  onBack 
}: InitialResponseScreenProps) {
  const [countdown, setCountdown] = useState(30);

  // Countdown effect
  useEffect(() => {
    if (!isDetailedAnalysisReady && initialResult) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDetailedAnalysisReady, initialResult]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* Query Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-4 mb-8 text-center relative w-full max-w-2xl"
      >
        <button
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 btn-secondary text-sm flex items-center gap-2"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="px-16">
          <h2 className="font-serif text-2xl text-nature-800 mb-2">
            {queryData.query}
          </h2>
          <p className="text-nature-600 text-sm">
            Location: {queryData.location.lat.toFixed(4)}, {queryData.location.lng.toFixed(4)}
          </p>
        </div>
      </motion.div>

      {/* Loading or Result */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        {!initialResult ? (
          <div className="glass-card p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <motion.div
                  className="absolute inset-0 border-4 border-nature-200 rounded-full"
                  style={{ borderTopColor: 'var(--nature-500)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-nature-600">Analyzing environmental data...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <p className="text-nature-800 leading-relaxed">{initialResult}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Countdown Timer or Continue Button */}
      {initialResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {!isDetailedAnalysisReady ? (
            <p className="text-nature-600 text-sm">
              Loading final chart and analysis in {countdown} seconds...
            </p>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onContinue}
              className="btn-primary flex items-center gap-2"
            >
              View Detailed Analysis
              <IconArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 