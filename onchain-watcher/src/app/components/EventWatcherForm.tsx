import React, { FormEvent } from 'react';
import EventNameComboBox from './EventNameComboBox';
import AddressInput from './AddressInput';

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
  setEvents: (v: any) => void;
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
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* RPC WS URL */}
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        RPC WS URL
      </label>
      <input
        type="text"
        value={rpcUrl}
        onChange={(e) => setRpcUrl(e.target.value)}
        placeholder="wss://your-node"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
        required
      />
    </div>
    {/* Contract Address */}
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Contract Address
      </label>
      <input
        type="text"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="0x1234…"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition"
        required
      />
    </div>
    {/* Event Name */}
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Event Name
      </label>
      <EventNameComboBox
        options={['All Events', 'Transfer', 'Approval']}
        value={eventName}
        onChange={setEventName}
        allowCustom={true}
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
      disabled={listening || (eventName === 'Transfer' && ((fromAddress && !fromResolved) || (toAddress && !toResolved)))}
    >
      {listening ? 'Listening…' : 'Connect'}
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

export default EventWatcherForm; 