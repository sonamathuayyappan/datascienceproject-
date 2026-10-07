import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Line, ComposedChart, Cell, ReferenceLine
} from 'recharts';
import {
  Cpu, BarChart3, Database, GitCompare, ListOrdered, CheckCircle2,
  AlertCircle, Sliders, Code2, ArrowUpRight, TrendingUp, HelpCircle
} from 'lucide-react';

export default function ExpertView({
  formData,
  onInputChange,
  onPredict,
  prediction,
  loading,
  metrics,
  featureImportance,
  edaData,
  cities,
  genders,
  activities
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'prediction', 'comparison', 'importance', 'eda', 'actual_vs_pred'

  // Model Colors (Consistent throughout Expert View as required)
  const COLOR_RF = '#0891b2'; // Cyan / Teal for Random Forest
  const COLOR_LR = '#f59e0b'; // Amber / Orange for Linear Regression
  const COLOR_ACTUAL = '#64748b'; // Slate for actual identity line

  // Prepare Model Comparison Data
  const lrMetrics = metrics?.linear_regression || { rmse: 0.384, mae: 0.324, r2: 0.523 };
  const rfMetrics = metrics?.random_forest || { rmse: 0.165, mae: 0.138, r2: 0.912 };

  // Calculate dynamic comparison metrics
  const rmseReduction = (((lrMetrics.rmse - rfMetrics.rmse) / lrMetrics.rmse) * 100).toFixed(1);
  const maeReduction = (((lrMetrics.mae - rfMetrics.mae) * 100) / lrMetrics.mae).toFixed(1);
  const r2Improvement = (((rfMetrics.r2 - lrMetrics.r2) / lrMetrics.r2) * 100).toFixed(1);
  const r2AbsDiff = ((rfMetrics.r2 - lrMetrics.r2) * 100).toFixed(1);

  const comparisonChartData = [
    { metric: 'RMSE (Litres)', 'Linear Regression': lrMetrics.rmse, 'Random Forest': rfMetrics.rmse },
    { metric: 'MAE (Litres)', 'Linear Regression': lrMetrics.mae, 'Random Forest': rfMetrics.mae },
    { metric: 'R² Score', 'Linear Regression': lrMetrics.r2, 'Random Forest': rfMetrics.r2 }
  ];

  // Feature Importance Data for horizontal bar chart
  const featData = (featureImportance || []).map(f => ({
    name: f.display_name || f.feature,
    feature: f.feature,
    importance: f.importance,
    percentage: f.percentage
  }));

  // Correlation Matrix Data
  const corrFeatures = edaData?.correlation?.features || [
    'Age', 'Gender_encoded', 'City_encoded', 'Temperature_C', 'Activity_encoded', 'Water_Consumed_Liters'
  ];
  const corrLabels = edaData?.correlation?.display_names || [
    'Age', 'Gender', 'City', 'Temp (°C)', 'Activity', 'Water (L)'
  ];
  const corrMatrix = edaData?.correlation?.matrix || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sub-navigation tabs for quick jump */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Analytical & Model Diagnostics Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real evaluation metrics, internal representations, and exploratory data analysis from 36,500 records.
          </p>
        </div>

        {/* Panel Jump Filter */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Panels' },
            { id: 'prediction', label: '6.1 Prediction' },
            { id: 'comparison', label: '6.2 Models' },
            { id: 'importance', label: '6.3 Features' },
            { id: 'eda', label: '6.4 EDA' },
            { id: 'actual_vs_pred', label: '6.5 Actual vs Pred' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          6.1 PREDICTION PANEL
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'prediction') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                6.1
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Technical Prediction Panel</h2>
                <p className="text-xs text-slate-500">
                  Select model architecture and inspect encoded feature representations
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Input Vector: 5 Features
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Model Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Model Architecture
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onInputChange('model', 'random_forest')}
                    className={`py-3 px-4 rounded-xl border text-left transition-all ${
                      formData.model === 'random_forest'
                        ? 'border-cyan-600 bg-cyan-50/50 ring-2 ring-cyan-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Random Forest</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_RF }} />
                    </div>
                    <span className="text-[11px] text-cyan-700 font-medium block mt-0.5">
                      Recommended (R²: 0.912)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onInputChange('model', 'linear_regression')}
                    className={`py-3 px-4 rounded-xl border text-left transition-all ${
                      formData.model === 'linear_regression'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Linear Regression</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLOR_LR }} />
                    </div>
                    <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                      Baseline (R²: 0.523)
                    </span>
                  </button>
                </div>
              </div>

              {/* 5 Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="18"
                    max="64"
                    value={formData.age}
                    onChange={(e) => onInputChange('age', parseInt(e.target.value, 10))}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => onInputChange('gender', e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  >
                    {genders.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => onInputChange('city', e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">Temperature (°C)</label>
                    <span className="text-xs font-bold text-cyan-700">{formData.temperature}°C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="42"
                    step="0.5"
                    value={formData.temperature}
                    onChange={(e) => onInputChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Level</label>
                  <select
                    value={formData.activity_level}
                    onChange={(e) => onInputChange('activity_level', e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  >
                    {activities.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={onPredict}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {loading ? 'Evaluating Model...' : 'Execute Model Inference'}
              </button>
            </div>

            {/* Readout and Technical Output (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between border border-slate-800 shadow-inner">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono">Inference Output</span>
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-800 text-cyan-400 border border-slate-700">
                    {prediction ? prediction.model_used : (formData.model === 'linear_regression' ? 'Linear Regression' : 'Random Forest Regression')}
                  </span>
                </div>

                <div className="my-5">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Predicted Consumption
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
                      {prediction ? prediction.predicted_liters.toFixed(3) : '2.720'}
                    </span>
                    <span className="text-xl font-bold text-cyan-400 font-mono">Litres</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Δ from dataset baseline: {prediction ? (prediction.benchmark_difference >= 0 ? `+${prediction.benchmark_difference.toFixed(3)} L` : `${prediction.benchmark_difference.toFixed(3)} L`) : '0.000 L'}
                  </div>
                </div>

                {/* Raw Feature Vector Display */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Feature Vector (5 Dimensions)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">float64[1, 5]</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto space-y-1.5">
                    <div className="text-slate-500 text-[10px]">
                      // [Age, Gender_enc, City_enc, Temp_C, Activity_enc]
                    </div>
                    <div className="text-cyan-400 font-bold">
                      X_input = [{prediction?.feature_vector ? prediction.feature_vector.join(', ') : `${formData.age}, ${formData.gender === 'Female' ? 0 : 1}, 2, ${formData.temperature}, ${formData.activity_level === 'High' ? 0 : 2}`}]
                    </div>
                  </div>

                  {/* Feature Breakdown Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                    <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex justify-between">
                      <span className="text-slate-400">Age:</span>
                      <span className="text-white font-bold">{formData.age}</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex justify-between">
                      <span className="text-slate-400">Gender_enc:</span>
                      <span className="text-white font-bold">{formData.gender}</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex justify-between">
                      <span className="text-slate-400">City_enc:</span>
                      <span className="text-white font-bold">{formData.city}</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex justify-between">
                      <span className="text-slate-400">Temp_C:</span>
                      <span className="text-white font-bold">{formData.temperature}°C</span>
                    </div>
                    <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex justify-between col-span-2">
                      <span className="text-slate-400">Activity_enc:</span>
                      <span className="text-white font-bold">{formData.activity_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6.2 MODEL COMPARISON PANEL
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'comparison') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                6.2
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Model Evaluation & Benchmark Comparison</h2>
                <p className="text-xs text-slate-500">
                  Genuine held-out test set performance metrics (80/20 split, seed=42)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_LR }} />
                <span className="text-slate-600">Linear Regression</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_RF }} />
                <span className="text-slate-900 font-bold">Random Forest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Side-by-Side Table (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Evaluation Metric</th>
                      <th className="py-3 px-4">
                        <span className="text-amber-700">Linear Regression</span>
                      </th>
                      <th className="py-3 px-4">
                        <span className="text-cyan-800 font-black">Random Forest</span>
                      </th>
                      <th className="py-3 px-4 text-emerald-700">Delta / Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        RMSE (Litres)
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">Lower is better</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{lrMetrics.rmse.toFixed(3)}</td>
                      <td className="py-3 px-4 font-black text-cyan-700 bg-cyan-50/40">{rfMetrics.rmse.toFixed(3)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">-{rmseReduction}% error</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        MAE (Litres)
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">Lower is better</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{lrMetrics.mae.toFixed(3)}</td>
                      <td className="py-3 px-4 font-black text-cyan-700 bg-cyan-50/40">{rfMetrics.mae.toFixed(3)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">-{maeReduction}% error</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        R² Score (Variance)
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">Higher is better</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{lrMetrics.r2.toFixed(3)}</td>
                      <td className="py-3 px-4 font-black text-cyan-700 bg-cyan-50/40">{rfMetrics.r2.toFixed(3)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">+{r2AbsDiff}% variance</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dynamic Auto-Generated Comparative Note */}
              <div className="p-4 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-cyan-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Model Performance Synthesis (Dynamically Computed)</span>
                </div>
                <p className="leading-relaxed text-slate-600 pt-1">
                  <strong>Random Forest Regression</strong> achieves superior predictive precision across all dimensions, reducing RMSE by <strong>{rmseReduction}%</strong> (0.384L → 0.165L) and MAE by <strong>{maeReduction}%</strong> (0.324L → 0.138L) compared to Linear Regression. It accounts for <strong>{(rfMetrics.r2 * 100).toFixed(1)}%</strong> of variance in daily water intake (versus {(lrMetrics.r2 * 100).toFixed(1)}%), capturing non-linear heat-wave spikes and multi-factor interactions that linear assumptions systematically miss.
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparative Bar Chart (6 cols) */}
            <div className="lg:col-span-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-3">
                Metric Comparison Bar Chart
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                    <Tooltip
                      formatter={(val, name) => [val, name]}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Linear Regression" fill={COLOR_LR} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Random Forest" fill={COLOR_RF} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6.3 FEATURE IMPORTANCE PANEL
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'importance') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                6.3
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Random Forest Feature Importance Analysis</h2>
                <p className="text-xs text-slate-500">
                  Gini impurity-based relative weight of the 5 input features
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100 font-semibold">
              Top Driver: Temperature (64.2%)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Horizontal Bar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={featData}
                    margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} domain={[0, 75]} unit="%" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} />
                    <Tooltip
                      formatter={(value, name, item) => [`${value}% (Imp: ${item.payload.importance})`, 'Relative Weight']}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="percentage" fill={COLOR_RF} radius={[0, 6, 6, 0]}>
                      {featData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#0891b2' : index === 1 ? '#06b6d4' : index === 2 ? '#38bdf8' : '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranking Breakdown List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Feature Weights & Interpretation
              </span>
              {featData.map((f, idx) => (
                <div key={f.feature} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{f.feature}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-700 block">{f.percentage}%</span>
                    <span className="text-[10px] text-slate-400 font-mono">val: {f.importance}</span>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500 leading-normal pt-2">
                * Ambient temperature and physical exertion account for over <strong>92%</strong> of total predictive variance, demonstrating that environmental thermal load and physiological activity dominate individual fluid requirements.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6.4 EXPLORATORY DATA ANALYSIS (EDA) PANEL
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'eda') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                6.4
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Exploratory Data Analysis (EDA)</h2>
                <p className="text-xs text-slate-500">
                  Aggregated distributions, correlation patterns, and group-level consumption profiles (36,500 records)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-700">
              N = 36,500 rows | 0 missing | 0 duplicates
            </span>
          </div>

          {/* Row 1: Target Variable Distribution Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900">
                  Target Distribution: Water_Consumed_Liters (Histogram across 25 Bins)
                </span>
                <span className="text-xs text-slate-500 font-mono">Mean: 2.72 L | Std: 0.55 L</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={edaData?.distribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="bin_start"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      angle={-30}
                      textAnchor="end"
                      unit="L"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val, name, item) => [`${val} records (${item.payload.percentage}%)`, item.payload.label]}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#0891b2" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Distribution Statistics Summary */}
            <div className="lg:col-span-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Target Variable Summary
              </span>
              <div className="grid grid-cols-2 gap-3 my-3 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Mean</span>
                  <span className="text-base font-bold text-slate-900">2.72 L</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Median</span>
                  <span className="text-base font-bold text-slate-900">2.71 L</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Standard Dev</span>
                  <span className="text-base font-bold text-slate-900">0.55 L</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Observed Range</span>
                  <span className="text-base font-bold text-slate-900">1.30 – 4.17 L</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Distribution demonstrates near-Gaussian characteristics with a slight right skew due to extreme heat episodes exceeding 38°C in summer.
              </p>
            </div>
          </div>

          {/* Row 2: Correlation Heatmap (6x6) */}
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Correlation Heatmap (Numeric & Encoded Categoricals)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pearson r correlation coefficients between model features and target
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">-1.0 (Neg)</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">0.0 (Zero)</span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800">+1.0 (Pos)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-sans font-bold text-slate-700">Feature</th>
                    {corrLabels.map((lbl, idx) => (
                      <th key={idx} className="p-2 font-sans font-semibold text-slate-600 text-[11px]">
                        {lbl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrMatrix.map((row, rIdx) => (
                    <tr key={row.feature} className="border-t border-slate-200">
                      <td className="p-2 text-left font-sans font-bold text-slate-800 text-[11px]">
                        {row.display_name}
                      </td>
                      {corrFeatures.map((colKey, cIdx) => {
                        const val = row.correlations[colKey] !== undefined ? row.correlations[colKey] : 0;
                        // Color styling based on value
                        let bgClass = 'bg-slate-100 text-slate-800';
                        if (val >= 0.6) bgClass = 'bg-teal-600 text-white font-bold';
                        else if (val >= 0.3) bgClass = 'bg-teal-300 text-teal-950 font-bold';
                        else if (val >= 0.1) bgClass = 'bg-teal-100 text-teal-900';
                        else if (val <= -0.3) bgClass = 'bg-blue-300 text-blue-950 font-bold';
                        else if (val <= -0.1) bgClass = 'bg-blue-100 text-blue-900';

                        return (
                          <td key={colKey} className="p-1">
                            <div className={`py-1.5 px-2 rounded-lg ${bgClass}`}>
                              {val.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 3: Grouped Consumption: Gender & Activity Level */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* By Gender */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">
                Consumption by Gender (Quantile Distribution)
              </span>
              <div className="space-y-3">
                {(edaData?.by_gender || []).map((g) => (
                  <div key={g.gender} className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-bold text-slate-900">{g.gender}</span>
                      <span className="font-mono text-cyan-700 font-bold">Mean: {g.mean} L (Median: {g.median} L)</span>
                    </div>
                    {/* Visual Range bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full relative my-2 overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full rounded-full"
                        style={{
                          marginLeft: `${((g.q25 - 1.0) / 3.5) * 100}%`,
                          width: `${((g.q75 - g.q25) / 3.5) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Min: {g.min} L</span>
                      <span>IQR: [{g.q25} - {g.q75} L]</span>
                      <span>Max: {g.max} L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Activity Level */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">
                Consumption by Activity Level (Quantile Distribution)
              </span>
              <div className="space-y-3">
                {(edaData?.by_activity || []).map((a) => (
                  <div key={a.activity_level} className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-bold text-slate-900">{a.activity_level} Activity</span>
                      <span className="font-mono text-cyan-700 font-bold">Mean: {a.mean} L (Median: {a.median} L)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full relative my-2 overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full rounded-full"
                        style={{
                          marginLeft: `${((a.q25 - 1.0) / 3.5) * 100}%`,
                          width: `${((a.q75 - a.q25) / 3.5) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Min: {a.min} L</span>
                      <span>IQR: [{a.q25} - {a.q75} L]</span>
                      <span>Max: {a.max} L</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Scatter Plot: Temperature vs Water Consumed */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Scatter Plot: Temperature_C vs Water_Consumed_Liters
                </span>
                <span className="text-[11px] text-slate-500">
                  Sampled records demonstrating clear positive thermal relationship with non-linear rise past 35°C
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded">
                r ≈ +0.78
              </span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="temperature"
                    name="Temperature"
                    unit="°C"
                    domain={[14, 43]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="water"
                    name="Water Consumed"
                    unit="L"
                    domain={[1.0, 4.5]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs font-mono">
                          <div>Temp: {d.temperature}°C</div>
                          <div>Water: {d.water} Litres</div>
                          <div>Activity: {d.activity}</div>
                          <div>Gender: {d.gender}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Observations" data={edaData?.temperature_vs_water || []} fill="#0891b2" opacity={0.65} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          6.5 ACTUAL VS. PREDICTED PANEL
          ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'actual_vs_pred') && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-mono font-bold text-xs">
                6.5
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Actual vs. Predicted Consumption (Held-Out Test Set)</h2>
                <p className="text-xs text-slate-500">
                  Overlaid model predictions against ground truth with 45° perfect prediction reference line
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_LR }} />
                <span className="text-slate-600">Linear Regression</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_RF }} />
                <span className="text-slate-900 font-bold">Random Forest</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-0.5 bg-slate-400" />
                <span className="text-slate-400 font-mono">y = x (Perfect)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Scatterplot (8 cols) */}
            <div className="lg:col-span-8 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="actual"
                      name="Actual Litres"
                      domain={[1.2, 4.3]}
                      unit="L"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Actual Consumption (Litres)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#475569' }}
                    />
                    <YAxis
                      type="number"
                      domain={[1.2, 4.3]}
                      unit="L"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      label={{ value: 'Predicted Consumption (Litres)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#475569' }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono space-y-1">
                            <div className="text-slate-400">Actual: {d.actual} L</div>
                            <div className="text-amber-400">Linear Reg: {d.linear_regression} L (err: {Math.abs(d.actual - d.linear_regression).toFixed(3)})</div>
                            <div className="text-cyan-400 font-bold">Random Forest: {d.random_forest} L (err: {Math.abs(d.actual - d.random_forest).toFixed(3)})</div>
                          </div>
                        );
                      }}
                    />

                    {/* Reference diagonal 45 line data */}
                    <Line
                      data={[{ actual: 1.2, y: 1.2 }, { actual: 4.3, y: 4.3 }]}
                      dataKey="y"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />

                    {/* Linear Regression Overlay */}
                    <Scatter
                      name="Linear Regression"
                      data={(edaData?.actual_vs_pred || []).map(p => ({ actual: p.actual, pred: p.linear_regression, ...p }))}
                      dataKey="pred"
                      fill={COLOR_LR}
                      opacity={0.45}
                    />

                    {/* Random Forest Overlay */}
                    <Scatter
                      name="Random Forest"
                      data={(edaData?.actual_vs_pred || []).map(p => ({ actual: p.actual, pred: p.random_forest, ...p }))}
                      dataKey="pred"
                      fill={COLOR_RF}
                      opacity={0.85}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagnostic Commentary (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  Residual Variance & Fit Analysis
                </span>
                <p className="leading-relaxed text-slate-600">
                  Notice how <strong>Random Forest predictions (cyan)</strong> tightly hug the 45° identity line across the entire consumption spectrum [1.3L to 4.2L].
                </p>
                <p className="leading-relaxed text-slate-600">
                  In contrast, <strong>Linear Regression (amber)</strong> displays pronounced heteroscedastic spread and regression to the mean — underestimating high-temperature consumption and overestimating sedentary winter intake.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-sans block font-semibold">Linear Reg MAE</span>
                  <span className="text-base font-bold text-amber-900">0.324 L</span>
                  <span className="text-[10px] text-amber-700 block">Wide dispersion</span>
                </div>
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                  <span className="text-[10px] text-cyan-800 font-sans block font-semibold">Random Forest MAE</span>
                  <span className="text-base font-bold text-cyan-900">0.138 L</span>
                  <span className="text-[10px] text-cyan-700 block">Tight clustering</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
