import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useEthereum } from '../hooks/useEthereum';

export function EthereumWallet() {
  const { status, address, balance, network, blockNumber, connect } = useEthereum();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Ethereum Wallet</h2>
        <span className="text-xs text-gray-600">{status}</span>
      </div>
      {address ? (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="font-mono text-xs break-all">{address}</div>
            <button onClick={copyAddress} className="p-1 rounded hover:bg-gray-200">
              <Copy className="h-4 w-4" />
            </button>
            {copied && <span className="text-xs text-green-600">Copied</span>}
          </div>
          <div className="text-gray-700 text-sm">Balance: <span className="font-semibold">{balance || '0'} ETH</span></div>
          {network && (
            <div className="text-gray-700 text-sm">Network: <span className="font-semibold">{network}</span></div>
          )}
          {blockNumber !== null && (
            <div className="text-gray-700 text-sm">Latest block: <span className="font-semibold">{blockNumber}</span></div>
          )}
        </div>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          disabled={status === 'connecting' || status === 'not-installed'}
        >
          {status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {status === 'not-installed' && (
        <div className="text-red-600 text-sm">MetaMask not detected.</div>
      )}
    </div>
  );
}
