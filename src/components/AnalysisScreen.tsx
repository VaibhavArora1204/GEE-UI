import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconChartLine, IconFileText, IconBulb } from '@tabler/icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { QueryData, AnalysisData } from '../App';

interface AnalysisScreenProps {
  queryData: QueryData;
  analysisData: AnalysisData;
  onBack: () => void;
}

type Tab = 'charts' | 'summary' | 'suggestions';

export default function AnalysisScreen({ queryData, analysisData, onBack }: AnalysisScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('charts');

  const tabs = [
    { id: 'charts' as Tab, label: 'Charts', icon: IconChartLine },
    { id: 'summary' as Tab, label: 'Summary', icon: IconFileText },
    { id: 'suggestions' as Tab, label: 'Suggestions', icon: IconBulb },
  ];

  // Generate a unique color for each dataset
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];
  const datasetNames = Object.keys(analysisData.charts.datasets);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-4 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-nature-800 mb-1">
              {queryData.query}
            </h2>
            <p className="text-nature-600 text-sm">
              Location: {queryData.location.lat.toFixed(4)}, {queryData.location.lng.toFixed(4)}
            </p>
          </div>
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <IconArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-nature-600 text-white'
                : 'bg-white/50 text-nature-600 hover:bg-white/80'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card p-8 flex-1"
        >
          {activeTab === 'charts' && (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData.charts.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis
                    dataKey="name"
                    stroke="#48894f"
                    tick={{ fill: '#48894f' }}
                  />
                  <YAxis
                    stroke="#48894f"
                    tick={{ fill: '#48894f' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  {datasetNames.map((dataset, index) => (
                    <Line
                      key={dataset}
                      type="monotone"
                      dataKey={dataset}
                      name={dataset.split('/').pop()}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="prose prose-nature max-w-none">
              <p className="text-nature-800 leading-relaxed text-lg">
                {analysisData.summary}
              </p>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {analysisData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white/50 p-4 rounded-lg border-l-4 border-nature-600"
                >
                  <p className="text-nature-800">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
} 