import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

type AddressDisplayProps = {
  address?: string;
};

const provider = ethers.getDefaultProvider(); // mainnet by default

const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
  const [ens, setEns] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!address) return;
    setEns(null);
    setLoading(true);
    (async () => {
      try {
        // If it's an ENS name, resolve to address
        if (address.endsWith('.eth')) {
          const resolved = await provider.resolveName(address);
          if (!ignore && resolved) setEns(resolved);
        } else if (ethers.isAddress(address)) {
          // If it's an address, lookup ENS name
          const name = await provider.lookupAddress(address);
          if (!ignore && name) setEns(name);
        }
      } catch {
        // ignore errors
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [address]);

  if (!address) return <span>-</span>;
  if (loading) return <span>{address} (resolving...)</span>;
  if (ens) {
    // If input was ENS, show ENS + address; if input was address, show ENS
    if (address.endsWith('.eth')) {
      return <span>{address} ({ens})</span>;
    } else {
      return <span>{ens} ({address})</span>;
    }
  }
  return <span>{address}</span>;
};

export default AddressDisplay; 