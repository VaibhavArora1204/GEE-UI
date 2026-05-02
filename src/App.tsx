import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import JSON5 from 'json5';

import QueryScreen from './components/QueryScreen';
import InitialResponseScreen from './components/InitialResponseScreen';
import AnalysisScreen from './components/AnalysisScreen';

// Types
export type QueryData = {
  query: string;
  location: { lat: number; lng: number };
  initialResponse?: string;
};

export type ChartDataPoint = {
  name: string;
  [key: string]: string | number | null;
};

interface ExecuteResponse {
  status: string;
  result: string;
}

interface ParsedExecuteResult {
  data_points: Record<string, number[]>;
  analysis_summary: string;
  analysis_suggestions: string;
}

export type AnalysisData = {
  charts: { data: ChartDataPoint[]; datasets: Record<string, number[]> };
  summary: string;
  suggestions: string[];
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<'query' | 'initial' | 'analysis'>('query');
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [initialResult, setInitialResult] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Parse the result string using JSON5 (handles single quotes, trailing commas, etc.)
  const parseExecuteResult = (raw: string): ParsedExecuteResult => {
    const trimmed = raw.trim();
    try {
      return JSON5.parse(trimmed);
    } catch (err) {
      console.error('Failed to parse execute payload:', trimmed.slice(0, 500));
      throw err;
    }
  };

  // Normalize each series to [0,1] by its max value
  const normalizeDataPoints = (dataPoints: Record<string, number[]>): Record<string, number[]> => {
    const normalized: Record<string, number[]> = {};
    Object.entries(dataPoints).forEach(([key, values]) => {
      const maxVal = Math.max(...values);
      normalized[key] = maxVal > 0 ? values.map(v => v / maxVal) : values.map(() => 0);
    });
    return normalized;
  };

  // Convert dataPoints into Recharts-ready array of objects, preserving all fields
  const formatChartData = (dataPoints: Record<string, number[]>): ChartDataPoint[] => {
    const entries = Object.entries(dataPoints);
    if (!entries.length) return [];
    // Determine max length among all series
    const length = entries.reduce((max, [, arr]) => Math.max(max, arr.length), 0);
    return Array.from({ length }, (_, i) => {
      const point: ChartDataPoint = { name: `Point ${i + 1}` };
      entries.forEach(([key, arr]) => {
        // Use null for missing values
        point[key] = i < arr.length ? arr[i] : null;
      });
      return point;
    });
  };

  const handleQuerySubmit = async (data: QueryData) => {
    setQueryData(data);
    setInitialResult(data.initialResponse ?? null);
    setAnalysisData(null);
    setCurrentScreen('initial');
    setLoadingAnalysis(true);

    try {
      // 1. Generate GEE code
      const genRes = await axios.post('https://gee-02fv.onrender.com/generate', {
        query: `${data.query.trim()} at latitude ${data.location.lat} and longitude ${data.location.lng}`,
      });
      console.log('Generate response:', genRes.data);
      if (genRes.data.status === 'success' && genRes.data.gee_code) {
        console.log('Generated GEE code:', genRes.data.gee_code);
        // 2. Execute GEE code
        const execRes = await axios.post<ExecuteResponse>('https://gee-02fv.onrender.com/execute', {
          gee_code: genRes.data.gee_code,
        });
        console.log('Execute response full data:', execRes.data);

        if (execRes.data.status === 'success') {
          const parsed = parseExecuteResult(execRes.data.result);
          if (!parsed.data_points || typeof parsed.data_points !== 'object') {
            console.error('No valid data_points in response:', parsed);
            return;
          }

          // 3. Normalize and format chart data
          const normalizedPoints = normalizeDataPoints(parsed.data_points);
          const chartData = formatChartData(normalizedPoints);

          // 4. Update state
          setAnalysisData({
            charts: { data: chartData, datasets: normalizedPoints },
            summary: parsed.analysis_summary || 'No summary available',
            suggestions: parsed.analysis_suggestions.split('\n').filter(s => s.trim()),
          });
        } else {
          console.error('Execute API returned error status:', execRes.data);
        }
      } else {
        console.error('Generate API returned error status:', genRes.data);
      }
    } catch (err) {
      console.error('Overall analysis chain error:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleBack = () => {
    if (currentScreen === 'analysis') {
      setCurrentScreen('initial');
    } else if (currentScreen === 'initial') {
      setCurrentScreen('query');
      setQueryData(null);
      setInitialResult(null);
      setAnalysisData(null);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden font-sans relative">
      <AnimatePresence mode="wait">
        {currentScreen === 'query' && <QueryScreen key="query" onSubmit={handleQuerySubmit} />}
        {currentScreen === 'initial' && queryData && (
          <InitialResponseScreen
            key="initial"
            queryData={queryData}
            initialResult={initialResult}
            isDetailedAnalysisReady={!loadingAnalysis && Boolean(analysisData)}
            onContinue={() => setCurrentScreen('analysis')}
            onBack={handleBack}
          />
        )}
        {currentScreen === 'analysis' && queryData && analysisData && (
          <AnalysisScreen
            key="analysis"
            queryData={queryData}
            analysisData={analysisData}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
