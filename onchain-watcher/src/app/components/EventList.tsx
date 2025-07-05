import React, { useRef, useCallback, useEffect } from 'react';
import EventCard from './EventCard';
import { getExplorerTxUrl, getNetworkNameFromRpcUrl } from '../utils/getExplorerTxUrl';
import { VariableSizeList as List } from 'react-window';

type EventListProps = {
  events: Array<{
    args: Record<string, any>;
    transactionHash: string;
    blockNumber: number;
    eventName?: string;
    rpcUrl?: string;
  }>;
  eventName: string;
  eventCount: number;
  decimals: number;
  contractAddress: string;
  rpcUrl: string;
};

const EventList: React.FC<EventListProps> = ({ events, eventName, eventCount, decimals, contractAddress, rpcUrl }) => {
  // Use the provided rpcUrl, or fallback to the first event's rpcUrl if available
  const currentRpcUrl = rpcUrl || events[0]?.rpcUrl || '';
  const addressUrl = getExplorerTxUrl(currentRpcUrl, 'dummy').replace(/\/tx\/dummy$/, `/address/${contractAddress}`);
  const networkName = getNetworkNameFromRpcUrl(currentRpcUrl);
  
  // List height (px)
  const LIST_HEIGHT = 85 * 16; // max-h-[85vh] in px (1rem = 16px)

  // Ref for VariableSizeList
  const listRef = useRef<any>(null);

  // Force list to recalculate row heights when events change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [events]);
  
  // Calculate dynamic height for each item based on number of parameters
  const getItemSize = useCallback((index: number) => {
    const event = events[index];
    if (!event) return 120; // Default height
    
    const args = event.args || {};
    const eventName = event.eventName || '';
    
    // Base height for card structure
    let baseHeight = 120; // Event name, tx, block, and padding
    
    // Add height for each parameter
    let parameterCount = 0;
    
    if (eventName === 'Transfer') {
      parameterCount = 3; // from, to, value
    } else if (eventName === 'Approval') {
      parameterCount = 3; // owner, spender, value
    } else {
      // For other events, count actual parameters (up to 4)
      parameterCount = Math.min(
        Object.entries(args).filter(([key, value]) => value != null && value !== undefined).length,
        4
      );
    }
    
    // Each parameter adds about 24px (text-sm + padding)
    const parameterHeight = parameterCount * 24;
    
    // Add 12px margin between cards
    return baseHeight + parameterHeight + 12;
  }, [events]);
  
  // Row renderer for react-window
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={{ ...style, marginBottom: '12px' }}>
      <EventCard
        key={index}
        event={events[index]}
        decimals={decimals}
      />
    </div>
  ), [events, decimals]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 max-h-[95vh]">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 flex-wrap">
        Listening {eventName} events for
        <a
          href={addressUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-lg bg-blue-50 text-blue-800 px-2 py-0 rounded outline outline-1 outline-blue-300 ml-0"
        >
          {contractAddress}
        </a>
        contract
        {networkName && (
          <span className="ml-0">on {networkName}</span>
        )}
      </h2>
      <div className="mb-2 text-sm text-gray-600">Event count: <span className="font-bold">{eventCount}</span></div>
      <div className="overflow-y-auto max-h-[85vh] pr-1">
        {events.length === 0 ? (
          <p className="text-gray-500">No events yet.</p>
        ) : (
          <List
            ref={listRef}
            height={LIST_HEIGHT}
            itemCount={events.length}
            itemSize={getItemSize}
            width={"100%"}
            style={{ maxWidth: '100%' }}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
};

export default EventList; 