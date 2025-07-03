'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import { ethers, WebSocketProvider, formatEther, isAddress } from 'ethers';
import erc20Abi from './erc20.json';
import EventWatcherForm from './components/EventWatcherForm';
import EventList from './components/EventList';

// Minimal example ABI — only Transfer()
// Replace this with your contract's full ABI for arbitrary events
const ERC20_ABI = erc20Abi;

type EthersEvent = {
  args?: Record<string, any>;
  transactionHash: string;
  blockNumber: number;
  // Add more fields if needed
};

type ParsedEvent = {
  args: Record<string, any>;
  transactionHash: string;
  blockNumber: number;
};

export default function HomePage() {
  const [rpcUrl, setRpcUrl] = useState('wss://eth-mainnet.g.alchemy.com/v2/NusaomPiBicIShMt-rEsL_fy4wJkWgq9');
  const [contractAddress, setContractAddress] = useState('');
  const [eventName, setEventName] = useState('');
  const [listening, setListening] = useState(false);
  const [paused, setPaused] = useState(false);
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number>(18);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromResolved, setFromResolved] = useState<string | null>(null);
  const [toResolved, setToResolved] = useState<string | null>(null);
  const [fromError, setFromError] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const contractRef = useRef<any>(null); // Store contract instance for unsubscribing

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (listening) return;
    setListening(true);
    setError(null);
    if (eventName === 'Transfer') {
      if (fromAddress && !fromResolved) {
        setFromError('Invalid from address');
        setListening(false);
        return;
      }
      if (toAddress && !toResolved) {
        setToError('Invalid to address');
        setListening(false);
        return;
      }
    }
    try {
      const provider = new WebSocketProvider(rpcUrl);
      const contract = new ethers.Contract(
        contractAddress,
        [
          ...ERC20_ABI,
          'function decimals() view returns (uint8)',
        ],
        provider
      );
      contractRef.current = contract;
      try {
        const d = await contract.decimals();
        setDecimals(Number(d));
      } catch (decErr) {
        setDecimals(18);
      }
      if (eventName === 'All Events') {
        contract.on('*', (...args) => {
          if (paused) return;
          const event = args[args.length - 1];
          setEventCount((c) => c + 1);
          setEvents((prev) => [
            {
              args: event.args || {},
              transactionHash: event.log.transactionHash,
              blockNumber: event.log.blockNumber,
              eventName: event.eventName || (event.fragment && event.fragment.name) || 'Unknown',
            },
            ...prev,
          ]);
        });
        return;
      }
      if (typeof (contract.filters as any)[eventName] !== 'function') {
        setError(`Event '${eventName}' not found in contract ABI.`);
        setListening(false);
        return;
      }
      if (eventName === 'Transfer') {
        contract.on(eventName, (from, to, value, event) => {
          if (paused) return;
          if (fromAddress && fromResolved && from.toLowerCase() !== fromResolved.toLowerCase()) return;
          if (toAddress && toResolved && to.toLowerCase() !== toResolved.toLowerCase()) return;
          setEventCount((c) => c + 1);
          setEvents((prev) => [
            {
              args: { from, to, value },
              transactionHash: event.log.transactionHash,
              blockNumber: event.log.blockNumber,
              eventName: event.eventName || (event.fragment && event.fragment.name) || 'Transfer',
            },
            ...prev,
          ]);
        });
        return;
      }
      contract.on(eventName, (...args) => {
        if (paused) return;
        const event = args[args.length - 1];
        setEventCount((c) => c + 1);
        setEvents((prev) => [
          {
            args: event.args || {},
            transactionHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
            eventName: event.eventName || (event.fragment && event.fragment.name) || eventName,
          },
          ...prev,
        ]);
      });
    } catch (err) {
      console.error('Subscription error:', err);
      setListening(false);
    }
  }

  // Stop listening handler
  function handleStop() {
    if (contractRef.current && typeof contractRef.current.off === 'function') {
      try {
        if (eventName === 'All Events') {
          contractRef.current.removeAllListeners();
        } else {
          contractRef.current.removeAllListeners(eventName);
        }
      } catch (e) {
        // fallback for ethers v5
        if (eventName === 'All Events') {
          contractRef.current.off();
        } else {
          contractRef.current.off(eventName);
        }
      }
    }
    setListening(false);
    setPaused(false);
    setEventCount(0);
  }

  useEffect(() => {
    setError(null);
    setFromError(null);
    setToError(null);
    setFromResolved(null);
    setToResolved(null);
  }, [eventName]);

  useEffect(() => {
    let ignore = false;
    if (!fromAddress) {
      setFromError(null);
      setFromResolved(null);
      setResolving(false);
      return;
    }
    if (isAddress(fromAddress)) {
      setFromError(null);
      setFromResolved(fromAddress);
      setResolving(false);
      return;
    }
    if (String(fromAddress).endsWith('.eth')) {
      setResolving(true);
      ethers.getDefaultProvider().resolveName(fromAddress).then(resolved => {
        if (ignore) return;
        if (resolved) {
          setFromError(null);
          setFromResolved(resolved);
        } else {
          setFromError('ENS name could not be resolved');
          setFromResolved(null);
        }
        setResolving(false);
      }).catch(() => {
        if (!ignore) {
          setFromError('ENS name could not be resolved');
          setFromResolved(null);
          setResolving(false);
        }
      });
      return () => { ignore = true; setResolving(false); };
    } else {
      setFromError('Invalid from address');
      setFromResolved(null);
      setResolving(false);
    }
  }, [fromAddress]);

  useEffect(() => {
    let ignore = false;
    if (!toAddress) {
      setToError(null);
      setToResolved(null);
      setResolving(false);
      return;
    }
    if (isAddress(toAddress)) {
      setToError(null);
      setToResolved(toAddress);
      setResolving(false);
      return;
    }
    if (String(toAddress).endsWith('.eth')) {
      setResolving(true);
      ethers.getDefaultProvider().resolveName(toAddress).then(resolved => {
        if (ignore) return;
        if (resolved) {
          setToError(null);
          setToResolved(resolved);
        } else {
          setToError('ENS name could not be resolved');
          setToResolved(null);
        }
        setResolving(false);
      }).catch(() => {
        if (!ignore) {
          setToError('ENS name could not be resolved');
          setToResolved(null);
          setResolving(false);
        }
      });
      return () => { ignore = true; setResolving(false); };
    } else {
      setToError('Invalid to address');
      setToResolved(null);
      setResolving(false);
    }
  }, [toAddress]);

  return (
    <main className="min-h-screen bg-purple-50 flex p-6 space-x-6">
      {/* Left Panel: Inputs & Controls */}
      <div className="w-1/3 bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-center">
            {error}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          On-Chain Event Watcher
        </h1>
        <EventWatcherForm
          rpcUrl={rpcUrl}
          setRpcUrl={setRpcUrl}
          contractAddress={contractAddress}
          setContractAddress={setContractAddress}
          eventName={eventName}
          setEventName={setEventName}
          listening={listening}
          paused={paused}
          setPaused={setPaused}
          setEvents={setEvents}
          setEventCount={setEventCount}
          handleSubmit={handleSubmit}
          handleStop={handleStop}
          fromAddress={fromAddress}
          setFromAddress={setFromAddress}
          toAddress={toAddress}
          setToAddress={setToAddress}
          fromError={fromError}
          toError={toError}
          resolving={resolving}
        />
      </div>
      {/* Right Panel: Log Viewer */}
      <EventList
        events={events}
        eventName={eventName}
        eventCount={eventCount}
        decimals={decimals}
        contractAddress={contractAddress}
      />
    </main>
  );
}
