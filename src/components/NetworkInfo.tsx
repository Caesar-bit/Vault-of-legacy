import { useEthereum } from '../hooks/useEthereum';
import { Globe, Blocks } from 'lucide-react';

export function NetworkInfo() {
  const { network, blockNumber, status } = useEthereum();

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6 space-y-1">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-700" />
          <span>Network Info</span>
        </h2>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
      {network && (
        <div className="flex items-center text-sm text-gray-700 space-x-1">
          <Globe className="h-4 w-4" />
          <span className="font-semibold">{network}</span>
        </div>
      )}
      {blockNumber !== null && (
        <div className="flex items-center text-sm text-gray-700 space-x-1">
          <Blocks className="h-4 w-4" />
          <span className="font-semibold">Block {blockNumber}</span>
        </div>
      )}
    </div>
  );
}
