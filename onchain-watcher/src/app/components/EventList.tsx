import React from 'react';
import EventCard from './EventCard';

type EventListProps = {
  events: Array<{
    args: Record<string, any>;
    transactionHash: string;
    blockNumber: number;
    eventName?: string;
  }>;
  eventName: string;
  eventCount: number;
  decimals: number;
  contractAddress: string;
};

const EventList: React.FC<EventListProps> = ({ events, eventName, eventCount, decimals, contractAddress }) => (
  <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 overflow-y-auto h-[80vh]">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      Listening {eventName} events for {contractAddress} contract
    </h2>
    <div className="mb-2 text-sm text-gray-600">Event count: <span className="font-bold">{eventCount}</span></div>
    {events.length === 0 ? (
      <p className="text-gray-500">No events yet.</p>
    ) : (
      <ul className="space-y-3">
        {events.map((ev, i) => (
          <EventCard
            key={i}
            event={ev}
            decimals={decimals}
          />
        ))}
      </ul>
    )}
  </div>
);

export default EventList; 