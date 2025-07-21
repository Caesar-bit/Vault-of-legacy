import { useEthereum } from '../hooks/useEthereum';

export function NetworkInfo() {
  const { network, blockNumber, status } = useEthereum();

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">Network Info</h2>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
      {network && <div className="text-sm text-gray-700">Network: <span className="font-semibold">{network}</span></div>}
      {blockNumber !== null && <div className="text-sm text-gray-700 mt-1">Latest block: <span className="font-semibold">{blockNumber}</span></div>}
    </div>
  );
}
