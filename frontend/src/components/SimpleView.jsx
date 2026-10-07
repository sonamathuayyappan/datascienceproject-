import React from 'react';
import { Droplet, Thermometer, User, MapPin, Activity, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function SimpleView({
  formData,
  onInputChange,
  onPredict,
  prediction,
  loading,
  cities,
  genders,
  activities
}) {
  const currentPredicted = prediction ? prediction.predicted_liters : 2.72;
  const maxCapacity = 5.0;
  const fillPercentage = Math.min(100, Math.max(15, (currentPredicted / maxCapacity) * 100));
  const glassCount = Math.round((currentPredicted * 1000) / 250); // 250ml per glass

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 text-cyan-800 text-xs font-semibold mb-4 border border-cyan-200">
          <Droplet className="w-4 h-4 text-cyan-600 fill-cyan-500" />
          <span>Smart Hydration Forecast</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          WATER<span className="text-cyan-600">WISE</span>
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-slate-600 font-medium max-w-xl mx-auto">
          Know how much water you need today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Daily Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter a few details for your customized estimate</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onPredict();
            }}
            className="space-y-6"
          >
            {/* Age Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-cyan-600" />
                  <span>Age</span>
                </label>
                <span className="text-sm font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-100">
                  {formData.age} years
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="64"
                value={formData.age}
                onChange={(e) => onInputChange('age', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>18 years</span>
                <span>40 years</span>
                <span>64 years</span>
              </div>
            </div>

            {/* Gender Segmented */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genders.map((g) => {
                  const isSelected = formData.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onInputChange('gender', g)}
                      className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all text-center ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/25 ring-2 ring-cyan-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>City of Residence</span>
              </label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => onInputChange('city', e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 text-slate-800 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white appearance-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                  <span>Ambient Temperature</span>
                </label>
                <span className="text-sm font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-100">
                  {formData.temperature}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="42"
                step="0.5"
                value={formData.temperature}
                onChange={(e) => onInputChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-sky-300 via-amber-300 to-rose-400 rounded-lg appearance-none cursor-pointer accent-cyan-700"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>15°C (Cool)</span>
                <span>28°C (Pleasant)</span>
                <span>42°C (High Heat)</span>
              </div>
            </div>

            {/* Activity Level Segmented */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>Physical Activity Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {activities.map((act) => {
                  const isSelected = formData.activity_level === act;
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => onInputChange('activity_level', act)}
                      className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/25 ring-2 ring-cyan-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{act}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                        {act === 'Low' ? 'Sedentary' : act === 'Medium' ? 'Moderate' : 'Strenuous'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold text-base tracking-wide shadow-lg shadow-cyan-600/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Calculating Intake...</span>
              ) : (
                <>
                  <Droplet className="w-5 h-5 fill-white" />
                  <span>Predict My Water Intake</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Friendly Result Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-cyan-950/20 border border-cyan-900/40 relative overflow-hidden">
            {/* Soft background ambient light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300/90 inline-block px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-700/40 mb-3">
                Recommended Daily Water
              </span>

              {/* Large Central Number */}
              <div className="my-2 flex items-baseline justify-center space-x-2">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-md">
                  {currentPredicted ? currentPredicted.toFixed(1) : '2.8'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                  Litres
                </span>
              </div>

              {/* Friendly descriptive badge based on mean 2.72 and std 0.55 */}
              <div className="mt-3">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-cyan-200">
                  {prediction ? prediction.status_label : 'Typical for your profile'}
                </span>
              </div>

              {/* Illustrative Filled Water Bottle Graphic */}
              <div className="my-8 flex justify-center items-center">
                <div className="relative w-28 sm:w-32 h-64 bg-slate-800/80 rounded-t-3xl rounded-b-4xl border-4 border-cyan-300/40 p-1.5 shadow-2xl overflow-hidden backdrop-blur-md">
                  {/* Bottle Cap */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-3 bg-cyan-400/80 rounded-t-md" />

                  {/* Measurement tick marks */}
                  <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between text-[9px] font-mono text-cyan-200/60 pointer-events-none z-20">
                    <span>5.0L</span>
                    <span>4.0L</span>
                    <span>3.0L</span>
                    <span>2.0L</span>
                    <span>1.0L</span>
                  </div>

                  {/* Liquid Fill Container */}
                  <div className="w-full h-full rounded-t-2xl rounded-b-3xl overflow-hidden relative bg-slate-900/90 flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-teal-400 relative transition-all duration-1000 ease-out"
                      style={{ height: `${fillPercentage}%` }}
                    >
                      {/* Water surface highlight */}
                      <div className="w-full h-2.5 bg-cyan-200/70 absolute top-0 left-0 opacity-80" />
                      {/* Internal bubbles/shimmer */}
                      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Friendly Equivalents */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cyan-900/60 text-left">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[11px] text-cyan-300 block">Glass Equivalent</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    ~{glassCount} Glasses
                  </span>
                  <span className="text-[10px] text-slate-400">(250 ml standard)</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[11px] text-cyan-300 block">500ml Bottles</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    ~{(currentPredicted / 0.5).toFixed(1)} Bottles
                  </span>
                  <span className="text-[10px] text-slate-400">throughout the day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Care & Hydration Tip Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-cyan-600">💡</span>
              <span>Personalized Hydration Advice</span>
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {formData.temperature > 32
                ? 'High ambient temperatures increase perspiration rapidly. Space your hydration evenly across every hour rather than drinking all at once.'
                : formData.activity_level === 'High'
                ? 'Your physical exertion increases fluid loss. Drink half a litre 30 minutes before working out and replenish regularly.'
                : 'Keep a reusable water bottle within arm’s reach to comfortably reach your daily hydration target.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
