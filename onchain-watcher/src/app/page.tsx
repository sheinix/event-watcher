'use client';

import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import { ethers, WebSocketProvider, isAddress } from 'ethers';
import erc20Abi from './erc20.json';
import EventWatcherForm from './components/EventWatcherForm';
import EventList from './components/EventList';
import BottomLeftInfo from './components/BottomLeftInfo';

// Minimal example ABI — only Transfer()
// Replace this with your contract's full ABI for arbitrary events
const ERC20_ABI = erc20Abi;

type ParsedEvent = {
  args: Record<string, unknown>;
  transactionHash: string;
  blockNumber: number;
  eventName?: string;
  rpcUrl?: string;
};

export default function HomePage() {
  const [rpcUrl, setRpcUrl] = useState('');
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
  const contractRef = useRef<ethers.Contract | null>(null); // Store contract instance for unsubscribing

  // Helper to attach listeners
  const attachListeners = useCallback((contract: ethers.Contract, rpcUrl: string) => {
    // Only keep a minimal log for listener attachment
    // console.log('[DEBUG] Attaching listeners for event:', eventName, 'on contract:', contract.address || contract.target);
    if (eventName === 'All Events') {
      contract.on('*', (...args: unknown[]) => {
        try {
          const event = args[args.length - 1] as { args?: Record<string, unknown>; log: { transactionHash: string; blockNumber: number }; eventName?: string; fragment?: { name: string } };
          // console.log('[DEBUG] All Events received:', event);
          setEventCount((c) => c + 1);
          setEvents((prev) => [
            {
              args: event.args || {},
              transactionHash: event.log.transactionHash,
              blockNumber: event.log.blockNumber,
              eventName: event.eventName || (event.fragment && event.fragment.name) || 'Unknown',
              rpcUrl,
            },
            ...prev,
          ].slice(0, 200)); // Keep only the last 200 events
        } catch (err) {
          console.error('[DEBUG] Error in event handler:', err);
        }
      });
      return;
    }
    if (typeof (contract.filters as Record<string, unknown>)[eventName] !== 'function') {
      // console.warn('[DEBUG] No filter function for event:', eventName);
      return;
    }
    if (eventName === 'Transfer') {
      contract.on(eventName, (from: unknown, to: unknown, value: unknown, event: { log: { transactionHash: string; blockNumber: number }; eventName?: string; fragment?: { name: string } }) => {
        // console.log('[DEBUG] Transfer event received:', { from, to, value, event });
        if (fromAddress && fromResolved && (from as string).toLowerCase() !== fromResolved.toLowerCase()) return;
        if (toAddress && toResolved && (to as string).toLowerCase() !== toResolved.toLowerCase()) return;
        setEventCount((c) => c + 1);
        setEvents((prev) => [
          {
            args: { from, to, value },
            transactionHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
            eventName: event.eventName || (event.fragment && event.fragment.name) || 'Transfer',
            rpcUrl,
          },
          ...prev,
        ].slice(0, 200)); // Keep only the last 200 events
      });
      return;
    }
    contract.on(eventName, (...args: unknown[]) => {
      const event = args[args.length - 1] as { args?: Record<string, unknown>; log: { transactionHash: string; blockNumber: number }; eventName?: string; fragment?: { name: string } };
      // console.log('[DEBUG] Event received for', eventName, ':', event);
      setEventCount((c) => c + 1);
      setEvents((prev) => [
        {
          args: event.args || {},
          transactionHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
          eventName: event.eventName || (event.fragment && event.fragment.name) || eventName,
          rpcUrl,
        },
        ...prev,
      ].slice(0, 200)); // Keep only the last 200 events
    });
  }, [eventName, fromAddress, fromResolved, toAddress, toResolved]);

  // Switch event listeners when eventName changes, but keep events list
  useEffect(() => {
    if (!listening) return;
    if (!contractRef.current) return;
    // Remove all previous listeners
    try {
      contractRef.current.removeAllListeners();
    } catch {
      if (contractRef.current.off) {
        contractRef.current.off('*');
      }
    }
    // Attach new listener for the selected event
    attachListeners(contractRef.current, rpcUrl);
    // Do NOT clear events state here, so previous events remain visible
  }, [eventName, listening, attachListeners, rpcUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (listening) return;
    setListening(true);
    setError(null);
    if (eventName === 'Transfer') {
      if (fromAddress && !fromResolved) {
        setError('Invalid from address');
        setListening(false);
        return;
      }
      if (toAddress && !toResolved) {
        setError('Invalid to address');
        setListening(false);
        return;
      }
    }
    try {
      const provider = new WebSocketProvider(rpcUrl);
      // Remove contract/ABI debug logs
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
      } catch {
        setDecimals(18);
      }
      setEvents([]);
      setEventCount(0);
      attachListeners(contract, rpcUrl);
      // Remove contract object debug logs
    } catch (err) {
      console.error('Subscription error:', err);
      setListening(false);
    }
  }

  // Stop listening handler
  function handleStop() {
    if (contractRef.current) {
      if (typeof contractRef.current.removeAllListeners === 'function') {
        contractRef.current.removeAllListeners();
      } else if (typeof contractRef.current.off === 'function') {
        contractRef.current.off('*');
      }
    }
    setListening(false);
    setPaused(false);
    setEventCount(0);
  }

  useEffect(() => {
    setError(null);
    setFromResolved(null);
    setToResolved(null);
  }, [eventName]);

  useEffect(() => {
    let ignore = false;
    if (!fromAddress) {
      setFromResolved(null);
      return;
    }
    if (isAddress(fromAddress)) {
      setFromResolved(fromAddress);
      return;
    }
    if (String(fromAddress).endsWith('.eth')) {
      ethers.getDefaultProvider().resolveName(fromAddress).then(resolved => {
        if (ignore) return;
        if (resolved) {
          setFromResolved(resolved);
        } else {
          setError('ENS name could not be resolved');
          setFromResolved(null);
        }
      }).catch(() => {
        if (!ignore) {
          setError('ENS name could not be resolved');
          setFromResolved(null);
        }
      });
      return () => { ignore = true; };
    } else {
      setError('Invalid from address');
      setFromResolved(null);
    }
  }, [fromAddress]);

  useEffect(() => {
    let ignore = false;
    if (!toAddress) {
      setToResolved(null);
      return;
    }
    if (isAddress(toAddress)) {
      setToResolved(toAddress);
      return;
    }
    if (String(toAddress).endsWith('.eth')) {
      ethers.getDefaultProvider().resolveName(toAddress).then(resolved => {
        if (ignore) return;
        if (resolved) {
          setToResolved(resolved);
        } else {
          setError('ENS name could not be resolved');
          setToResolved(null);
        }
      }).catch(() => {
        if (!ignore) {
          setError('ENS name could not be resolved');
          setToResolved(null);
        }
      });
      return () => { ignore = true; };
    } else {
      setError('Invalid to address');
      setToResolved(null);
    }
  }, [toAddress]);

  // Always show events, even when paused
  const visibleEvents = events;

  return (
    <main className="min-h-screen bg-purple-50 flex p-6 space-x-6">
      {/* Left Panel: Inputs & Controls */}
      <div className="w-1/3 bg-white rounded-2xl shadow-xl p-8 space-y-6 self-start">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-center">
            {error}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          On-Chain Event Monitor
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
          fromResolved={fromResolved}
          setFromResolved={setFromResolved}
          toResolved={toResolved}
          setToResolved={setToResolved}
        />
      </div>
      {/* Right Panel: Log Viewer */}
      <div className="flex-1 flex flex-col">
        <EventList
          events={visibleEvents}
          eventName={eventName}
          eventCount={eventCount}
          decimals={decimals}
          contractAddress={contractAddress}
          rpcUrl={rpcUrl}
        />
      </div>
      <BottomLeftInfo />
    </main>
  );
}
