import React from 'react';
import { formatUnits } from 'ethers';
import { getExplorerTxUrl } from '../utils/getExplorerTxUrl';

type EventCardProps = {
  event: {
    args: Record<string, unknown>;
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
  const txEventLogUrl = `${txUrl}#eventlog`;

  // Helper function to render a parameter value
  const renderParameterValue = (key: string, value: unknown) => {
    const isAddress = typeof value === 'string' && value.startsWith('0x') && value.length === 42;
    const isValue = key.toLowerCase().includes('value') || key.toLowerCase().includes('amount');
    
    if (isAddress) {
      const addressUrl = txUrl.replace(/\/tx\/.*/, `/address/${value}`);
      return (
        <a
          href={addressUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
        >
          {value}
        </a>
      );
    } else if (isValue && value != null) {
      return (
        <span className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 whitespace-nowrap overflow-x-auto">
          {formatUnits(value as string, decimals)}
        </span>
      );
    } else {
      return (
        <span className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 whitespace-nowrap overflow-x-auto">
          {value != null ? String(value) : 'N/A'}
        </span>
      );
    }
  };

  // Get event parameters to display
  const getEventParameters = () => {
    const args = event.args || {};
    const eventName = event.eventName || '';
    
    // Special handling for Transfer event
    if (eventName === 'Transfer') {
      return [
        { key: 'from', value: args.from, label: 'From' },
        { key: 'to', value: args.to, label: 'To' },
        { key: 'value', value: args.value, label: 'Value' }
      ];
    }
    
    // Special handling for Approval event
    if (eventName === 'Approval') {
      return [
        { key: 'owner', value: args.owner, label: 'Owner' },
        { key: 'spender', value: args.spender, label: 'Spender' },
        { key: 'value', value: args.value, label: 'Value' }
      ];
    }
    
    // For other events, show all parameters (up to 4)
    const parameters = Object.entries(args)
      .filter(([, value]) => value != null && value !== undefined)
      .slice(0, 4) // Limit to 4 parameters
      .map(([key, value]) => ({
        key,
        value,
        label: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
      }));
    
    return parameters;
  };

  const parameters = getEventParameters();

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
      <p className="font-bold text-black mb-2">{event.eventName}</p>
      
      <div className="space-y-1">
        {/* Transaction Hash */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">Tx:</span>
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
          >
            {event.transactionHash}
          </a>
        </div>
        
        {/* Block Number */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">Block:</span>
          <a
            href={blockUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded outline outline-1 outline-blue-300 hover:bg-blue-100 hover:outline-blue-500 transition whitespace-nowrap overflow-x-auto"
          >
            {event.blockNumber}
          </a>
        </div>
        
        {/* Dynamic Event Parameters */}
        {parameters.map((param) => (
          <div key={param.key} className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{param.label}:</span>
            {renderParameterValue(param.key, param.value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCard; 