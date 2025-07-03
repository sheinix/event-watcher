import React from 'react';
import { formatUnits } from 'ethers';
import AddressDisplay from './AddressDisplay';

type EventCardProps = {
  event: {
    args: Record<string, any>;
    transactionHash: string;
    blockNumber: number;
    eventName?: string;
  };
  decimals: number;
};

const EventCard: React.FC<EventCardProps> = ({ event, decimals }) => (
  <li className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    {/* Event Name */}
    <p className="font-bold text-black mb-1">{event.eventName}</p>
    {/* Transaction & Block */}
    <p>
      <span className="font-medium">Tx:</span>{' '}
      <code className="break-all">{event.transactionHash}</code>
    </p>
    <p>
      <span className="font-medium">Block:</span> {event.blockNumber}
    </p>
    {/* Decoded Args: from, to, value */}
    <div className="mt-2 space-y-1">
      <p>
        <span className="font-bold">From:</span>{' '}
        <AddressDisplay address={event.args.from} />
      </p>
      <p>
        <span className="font-bold">To:</span>{' '}
        <AddressDisplay address={event.args.to} />
      </p>
      <p>
        <span className="font-bold">Value:</span>{' '}
        {event.args.value != null ? formatUnits(event.args.value, decimals) : 'N/A'}
      </p>
    </div>
  </li>
);

export default EventCard; 