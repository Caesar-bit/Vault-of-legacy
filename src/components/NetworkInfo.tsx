import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export function NetworkInfo() {
  const [network, setNetwork] = useState<string>('');
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInfo = async () => {
    setError('');
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      setNetwork(net.name ? `${net.name} (${net.chainId})` : `${net.chainId}`);
      const block = await provider.getBlockNumber();
      setBlockNumber(block);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch network info';
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Network Info</h2>
        <button onClick={fetchInfo} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {network && <div className="text-sm text-gray-700">Network: <span className="font-semibold">{network}</span></div>}
      {blockNumber !== null && <div className="text-sm text-gray-700 mt-1">Latest block: <span className="font-semibold">{blockNumber}</span></div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}
