import React from 'react';
import { formatUnits } from 'ethers';
import { getExplorerTxUrl } from '../utils/getExplorerTxUrl';

type EventCardProps = {
  event: {
    args: Record<string, any>;
    transactionHash: string;
    blockNumber: number;
    eventName?: string;
    rpcUrl?: string;
  };
  decimals: number;
};

const EventCard: React.FC<EventCardProps> = ({ event, decimals }) => {
  const rpcUrl = event.rpcUrl || '';
  const txUrl = getExplorerTxUrl(rpcUrl, event.transactionHash);
  const blockUrl = txUrl.replace(/\/tx\/.*/, `/block/${event.blockNumber}`);
  const fromUrl = event.args.from ? txUrl.replace(/\/tx\/.*/, `/address/${event.args.from}`) : undefined;
  const toUrl = event.args.to ? txUrl.replace(/\/tx\/.*/, `/address/${event.args.to}`) : undefined;
  const txEventLogUrl = `${txUrl}#eventlog`;
  return (
    <div className="relative p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Top-right event log link */}
      <a
        href={txEventLogUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
        title="View event log in explorer"
      >
        View on Explorer
      </a>
      {/* Event Name */}
      <p className="font-bold text-black mb-1">{event.eventName}</p>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold">Tx:</span>
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
          >
            {event.transactionHash}
          </a>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold">Block:</span>
          <a
            href={blockUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
          >
            {event.blockNumber}
          </a>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold">From:</span>
          {event.args.from ? (
            <a
              href={fromUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
            >
              {event.args.from}
            </a>
          ) : (
            <span className="font-mono text-xs text-gray-400">-</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold">To:</span>
          {event.args.to ? (
            <a
              href={toUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
            >
              {event.args.to}
            </a>
          ) : (
            <span className="font-mono text-xs text-gray-400">-</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Value:</span>
          <span className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 whitespace-nowrap overflow-x-auto">
            {event.args.value != null ? formatUnits(event.args.value, decimals) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard; 