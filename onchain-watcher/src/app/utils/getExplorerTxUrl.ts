export function getExplorerTxUrl(rpcUrl: string, txHash: string): string {
  const url = rpcUrl.toLowerCase();
  let base = 'https://etherscan.io/tx/';
  if (url.includes('eth')) {
    if (url.includes('sepolia')) {
      base = 'https://sepolia.etherscan.io/tx/';
    } else if (url.includes('mainnet')) {
      base = 'https://etherscan.io/tx/';
    }
  }
  if (url.includes('optimism') || url.includes('opt')) {
    if (url.includes('mainnet')) {
      base = 'https://optimistic.etherscan.io/tx/';
    } else if (url.includes('sepolia')) {
      base = 'https://sepolia-optimism.etherscan.io/tx/';
    }
  }
  if (url.includes('arb')) {
    if (url.includes('mainnet')) {
      base = 'https://arbiscan.io/tx/';
    } else if (url.includes('sepolia')) {
      base = 'https://sepolia.arbiscan.io/tx/';
    }
  }
  if (url.includes('polygon')) {
    if (url.includes('mainnet')) {
      base = 'https://polygonscan.com/tx/';
    } else if (url.includes('amoy')) {
      base = 'https://amoy.polygonscan.com/tx/';
    }
  }
  if (url.includes('base')) {
    if (url.includes('mainnet')) {
      base = 'https://basescan.org/tx/';
    } else if (url.includes('sepolia')) {
      base = 'https://sepolia.basescan.org/tx/';
    }
  }
  if (url.includes('zksync')) {
    if (url.includes('mainnet')) {
      base = 'https://explorer.zksync.io/tx/';
    } else if (url.includes('sepolia')) {
      base = 'https://sepolia.explorer.zksync.io/tx/';
    }
  }
  return base + txHash;
}

export function getNetworkNameFromRpcUrl(rpcUrl: string): string {
  const url = rpcUrl.toLowerCase();
  if (url.includes('eth')) {
    if (url.includes('sepolia')) return 'Ethereum Sepolia';
    if (url.includes('mainnet')) return 'Ethereum Mainnet';
    return 'Ethereum';
  }
  if (url.includes('optimism') || url.includes('opt')) {
    if (url.includes('mainnet')) return 'Optimism Mainnet';
    if (url.includes('sepolia')) return 'Optimism Sepolia';
    return 'Optimism';
  }
  if (url.includes('arb')) {
    if (url.includes('mainnet')) return 'Arbitrum One';
    if (url.includes('sepolia')) return 'Arbitrum Sepolia';
    return 'Arbitrum';
  }
  if (url.includes('polygon')) {
    if (url.includes('mainnet')) return 'Polygon Mainnet';
    if (url.includes('amoy')) return 'Polygon Amoy';
    return 'Polygon';
  }
  if (url.includes('base')) {
    if (url.includes('mainnet')) return 'Base Mainnet';
    if (url.includes('sepolia')) return 'Base Sepolia';
    return 'Base';
  }
  if (url.includes('zksync')) {
    if (url.includes('mainnet')) return 'zkSync Mainnet';
    if (url.includes('sepolia')) return 'zkSync Sepolia';
    return 'zkSync';
  }
  return 'Unknown Network';
}

export function getChainIdFromRpcUrl(rpcUrl: string): string {
  const url = rpcUrl.toLowerCase();
  if (url.includes('eth')) {
    if (url.includes('sepolia')) return '11155111'; // Ethereum Sepolia
    if (url.includes('mainnet')) return '1'; // Ethereum Mainnet
    return '1'; // Default to Ethereum Mainnet
  }
  if (url.includes('optimism') || url.includes('opt')) {
    if (url.includes('mainnet')) return '10'; // Optimism Mainnet
    if (url.includes('sepolia')) return '11155420'; // Optimism Sepolia
    return '10'; // Default to Optimism Mainnet
  }
  if (url.includes('arb')) {
    if (url.includes('mainnet')) return '42161'; // Arbitrum One
    if (url.includes('sepolia')) return '421614'; // Arbitrum Sepolia
    return '42161'; // Default to Arbitrum One
  }
  if (url.includes('polygon')) {
    if (url.includes('mainnet')) return '137'; // Polygon Mainnet
    if (url.includes('amoy')) return '80002'; // Polygon Amoy
    return '137'; // Default to Polygon Mainnet
  }
  if (url.includes('base')) {
    if (url.includes('mainnet')) return '8453'; // Base Mainnet
    if (url.includes('sepolia')) return '84532'; // Base Sepolia
    return '8453'; // Default to Base Mainnet
  }
  if (url.includes('zksync')) {
    if (url.includes('mainnet')) return '324'; // zkSync Mainnet
    if (url.includes('sepolia')) return '300'; // zkSync Sepolia
    return '324'; // Default to zkSync Mainnet
  }
  return 'TODO'; // Unknown network, placeholder
}
