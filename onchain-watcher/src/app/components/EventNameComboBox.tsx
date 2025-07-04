import React from 'react';

type EventNameComboBoxProps = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowCustom: boolean;
  loading?: boolean;
  error?: string | null;
};

const EventNameComboBox: React.FC<EventNameComboBoxProps> = ({ options, value, onChange, allowCustom, loading, error }) => {
  const isCustom = allowCustom && value && !options.includes(value);

  return (
    <div className="space-y-2">
      <select
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
        value={isCustom ? 'custom' : value}
        onChange={e => {
          if (e.target.value === 'custom') {
            onChange('');
          } else {
            onChange(e.target.value);
          }
        }}
        disabled={loading}
      >
        {loading ? (
          <option value="" disabled>Loading...</option>
        ) : (
          options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))
        )}
        {allowCustom && !loading && <option value="custom">Other...</option>}
      </select>
      {error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
      {allowCustom && (isCustom || value === '') && !loading && (
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
          placeholder="Custom event name"
          value={isCustom ? value : ''}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default EventNameComboBox; 