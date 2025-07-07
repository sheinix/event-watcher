import React from 'react';

const BottomLeftInfo: React.FC = () => (
  <div className="fixed bottom-8 left-8 z-50 text-xs text-gray-600 select-none" style={{ pointerEvents: 'auto' }}>
    <div className="mb-2">
      <span className="font-semibold">How to use:</span>
      <ol className="list-decimal list-inside ml-4 mt-1">
        <li>
          Grab a WebSocket RPC URL from 
          <a href="https://www.alchemy.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1 mr-1">Alchemy</a>
          or
          <a href="https://www.infura.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">Infura</a>.
        </li>
        <li>
          Paste it in the <span className="font-mono bg-gray-100 px-1 rounded">RPC WS URL</span> input and start monitoring events from your contract.
        </li>
      </ol>
    </div>
    <div className="flex items-center gap-1">
      Made with <span className="text-red-500">❤️</span> by
      <a href="https://github.com/sheinix" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">@sheinix</a>
    </div>
  </div>
);

export default BottomLeftInfo; 