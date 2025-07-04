import React from 'react';
import EventCard from './EventCard';
import { getExplorerTxUrl, getNetworkNameFromRpcUrl } from '../utils/getExplorerTxUrl';
import { FixedSizeList as List } from 'react-window';

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
};

const EventList: React.FC<EventListProps> = ({ events, eventName, eventCount, decimals, contractAddress }) => {
  // Use the first event's rpcUrl if available, otherwise fallback to empty string
  const rpcUrl = events[0]?.rpcUrl || '';
  const addressUrl = getExplorerTxUrl(rpcUrl, 'dummy').replace(/\/tx\/dummy$/, `/address/${contractAddress}`);
  const networkName = getNetworkNameFromRpcUrl(rpcUrl);
  // Height per event card (px)
  const ITEM_HEIGHT = 200;
  // List height (px)
  const LIST_HEIGHT = 85 * 16; // max-h-[85vh] in px (1rem = 16px)
  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <EventCard
        key={index}
        event={events[index]}
        decimals={decimals}
      />
    </div>
  );
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
            height={LIST_HEIGHT}
            itemCount={events.length}
            itemSize={ITEM_HEIGHT}
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