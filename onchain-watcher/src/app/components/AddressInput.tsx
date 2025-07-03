import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface AddressInputProps {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  onResolved?: (resolved: string | null) => void;
}

const provider = ethers.getDefaultProvider();

const AddressInput: React.FC<AddressInputProps> = ({ value, onChange, label, placeholder, onResolved }) => {
  const [resolved, setResolved] = useState<string | null>(null);
  const [ens, setEns] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setResolved(null);
    setEns(null);
    setError(null);
    if (!value) {
      setLoading(false);
      if (onResolved) onResolved(null);
      return;
    }
    if (ethers.isAddress(value)) {
      setLoading(true);
      provider.lookupAddress(value).then(name => {
        if (ignore) return;
        setEns(name || null);
        setResolved(value);
        setError(null);
        setLoading(false);
        if (onResolved) onResolved(value);
      }).catch(() => {
        if (!ignore) {
          setEns(null);
          setResolved(value);
          setError(null);
          setLoading(false);
          if (onResolved) onResolved(value);
        }
      });
      return () => { ignore = true; };
    }
    if (String(value).endsWith('.eth')) {
      setLoading(true);
      provider.resolveName(value).then(addr => {
        if (ignore) return;
        if (addr) {
          setResolved(addr);
          setError(null);
          if (onResolved) onResolved(addr);
        } else {
          setResolved(null);
          setError('ENS name could not be resolved');
          if (onResolved) onResolved(null);
        }
        setLoading(false);
      }).catch(() => {
        if (!ignore) {
          setResolved(null);
          setError('ENS name could not be resolved');
          setLoading(false);
          if (onResolved) onResolved(null);
        }
      });
      return () => { ignore = true; };
    }
    setResolved(null);
    setError('Invalid address or ENS');
    setLoading(false);
    if (onResolved) onResolved(null);
    return () => { ignore = true; };
  }, [value, onResolved]);

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
      />
      {loading && <div className="text-xs text-purple-600">Resolving…</div>}
      {resolved && !loading && (
        <div className="text-xs text-green-700">Resolved: {resolved}{ens ? ` (${ens})` : ''}</div>
      )}
      {error && !loading && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
};

export default AddressInput; 