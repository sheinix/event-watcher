import React, { FormEvent, useEffect, useState } from 'react';
import EventNameComboBox from './EventNameComboBox';
import AddressInput from './AddressInput';
import fetchAbi from '../utils/fetchAbi';
import { Interface, JsonFragment } from 'ethers';

function getEventNames(abi: unknown[]): string[] {
  try {
    const iface = new Interface(abi as JsonFragment[]);
    // ethers v6+ does not expose iface.events, so filter fragments
    return iface.fragments
      .filter((frag: unknown) => (frag as { type: string }).type === 'event')
      .map((frag: unknown) => (frag as { name: string }).name);
  } catch {
    return [];
  }
}

type EventWatcherFormProps = {
  rpcUrl: string;
  setRpcUrl: (v: string) => void;
  contractAddress: string;
  setContractAddress: (v: string) => void;
  eventName: string;
  setEventName: (v: string) => void;
  listening: boolean;
  paused: boolean;
  setPaused: (v: (p: boolean) => boolean) => void;
  setEvents: React.Dispatch<React.SetStateAction<Array<{
    args: Record<string, unknown>;
    transactionHash: string;
    blockNumber: number;
    eventName?: string;
    rpcUrl?: string;
  }>>>;
  setEventCount: (v: number) => void;
  handleSubmit: (e: FormEvent) => void;
  handleStop: () => void;
  fromAddress: string;
  setFromAddress: (v: string) => void;
  toAddress: string;
  setToAddress: (v: string) => void;
  fromResolved: string | null;
  setFromResolved: (v: string | null) => void;
  toResolved: string | null;
  setToResolved: (v: string | null) => void;
};

const EventWatcherForm: React.FC<EventWatcherFormProps> = ({
  rpcUrl,
  setRpcUrl,
  contractAddress,
  setContractAddress,
  eventName,
  setEventName,
  listening,
  paused,
  setPaused,
  setEvents,
  setEventCount,
  handleSubmit,
  handleStop,
  fromAddress,
  setFromAddress,
  toAddress,
  setToAddress,
  fromResolved,
  setFromResolved,
  toResolved,
  setToResolved,
}) => {
  const [eventOptions, setEventOptions] = useState<string[]>(['All Events', 'Transfer', 'Approval']);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [abiError, setAbiError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractAddress || contractAddress.length !== 42) {
      setEventOptions(['All Events', 'Transfer', 'Approval']);
      setAbiError(null);
      setLoadingEvents(false);
      return;
    }
    setLoadingEvents(true);
    setAbiError(null);
    fetchAbi(contractAddress, rpcUrl)
      .then((abi) => {
        const names = getEventNames(abi);
        setEventOptions(['All Events', ...names]);
        setLoadingEvents(false);
      })
      .catch(() => {
        setAbiError('Contract not verified. Input your own custom event name.');
        setEventOptions(['All Events']);
        setLoadingEvents(false);
      });
  }, [contractAddress, rpcUrl]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* RPC WS URL */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-900">
          RPC WS URL
        </label>
        <input
          type="text"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="wss://your-node"
          className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 placeholder-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
          required
        />
      </div>
      {/* Contract Address */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-900">
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x1234…"
          className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 placeholder-gray-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
          required
        />
      </div>
      {/* Event Name */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-900">
          Event Name
        </label>
        <EventNameComboBox
          options={eventOptions}
          value={eventName}
          onChange={setEventName}
          allowCustom={true}
          loading={loadingEvents}
          error={abiError}
        />
      </div>
      {/* Show from/to only for Transfer */}
      {eventName === 'Transfer' && (
        <div className="space-y-1">
          <AddressInput
            label="From (optional)"
            value={fromAddress}
            onChange={setFromAddress}
            placeholder="0x... or vitalik.eth"
            onResolved={setFromResolved}
          />
          <AddressInput
            label="To (optional)"
            value={toAddress}
            onChange={setToAddress}
            placeholder="0x... or vitalik.eth"
            onResolved={setToResolved}
          />
        </div>
      )}
      {/* Connect Button */}
      <button
        type="submit"
        className="w-full bg-purple-400 text-white rounded-lg py-2 px-4 hover:bg-purple-500 transition"
        disabled={!!(listening || loadingEvents || abiError || (eventName === 'Transfer' && ((fromAddress && !fromResolved) || (toAddress && !toResolved))))}
      >
        {listening ? (paused ? 'Paused' : 'Listening…') : loadingEvents ? 'Loading…' : 'Connect'}
      </button>
      {/* Pause & Clear Controls */}
      {listening && (
        <div className="flex justify-between mt-4 space-x-4">
          <button
            type="button"
            onClick={() => setPaused(p => !p)}
            className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-sm transition"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEvents([]);
              setPaused(() => false);
              setEventCount(0);
            }}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-sm transition"
          >
            Stop
          </button>
        </div>
      )}
    </form>
  );
};

export default EventWatcherForm; 