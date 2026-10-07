import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SimpleView from './components/SimpleView';
import ExpertView from './components/ExpertView';
import {
  fetchHealth,
  fetchOptions,
  predictWater,
  fetchMetrics,
  fetchFeatureImportance,
  fetchEdaData
} from './api';
import { Droplet, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('simple'); // 'simple' | 'expert'
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Shared form inputs across both views (persisted on switch)
  const [formData, setFormData] = useState({
    age: 32,
    gender: 'Male',
    city: 'Lahore',
    temperature: 28.5,
    activity_level: 'Medium',
    model: 'random_forest'
  });

  // Cached API and metadata states
  const [cities, setCities] = useState([
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta'
  ]);
  const [genders, setGenders] = useState(['Male', 'Female', 'Other']);
  const [activities, setActivities] = useState(['Low', 'Medium', 'High']);
  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [edaData, setEdaData] = useState(null);

  // Initialize data on application load
  useEffect(() => {
    async function init() {
      // Health
      const health = await fetchHealth();
      setIsConnected(health?.status === 'ok');

      // Options
      const opts = await fetchOptions();
      if (opts.cities) setCities(opts.cities);
      if (opts.genders) setGenders(opts.genders);
      if (opts.activities) setActivities(opts.activities);

      // Metrics
      const m = await fetchMetrics();
      setMetrics(m);

      // Feature Importance
      const fi = await fetchFeatureImportance();
      setFeatureImportance(fi);

      // EDA data
      const eda = await fetchEdaData();
      setEdaData(eda);

      // Run initial baseline prediction
      const initialPred = await predictWater({
        age: 32,
        gender: 'Male',
        city: 'Lahore',
        temperature: 28.5,
        activity_level: 'Medium',
        model: 'random_forest'
      });
      setPrediction(initialPred);
    }
    init();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictWater(formData);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Universal App Header with View Switcher */}
      <Header
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'simple' ? (
          <SimpleView
            formData={formData}
            onInputChange={handleInputChange}
            onPredict={handlePredict}
            prediction={prediction}
            loading={loading}
            cities={cities}
            genders={genders}
            activities={activities}
          />
        ) : (
          <ExpertView
            formData={formData}
            onInputChange={handleInputChange}
            onPredict={handlePredict}
            prediction={prediction}
            loading={loading}
            metrics={metrics}
            featureImportance={featureImportance}
            edaData={edaData}
            cities={cities}
            genders={genders}
            activities={activities}
          />
        )}
      </main>

      {/* Clean, Professional Product Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 tracking-tight text-sm">
              WATER<span className="text-cyan-600">WISE</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Intelligent Water Intake Forecasting Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span>Trained on 36,500 daily consumption records</span>
            <span>Stateless &amp; Privacy Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
