import { useState } from 'react';
// Add TypeScript support for window.ethereum
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
import { ethers } from 'ethers';

export function EthereumWallet() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed.');
        setIsLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
      const bal = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(bal));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not connect wallet.';
      setError(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Ethereum Wallet</h2>
      <button
        onClick={connectWallet}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {address && (
        <div className="mb-2">
          <div className="text-gray-700 text-sm">Address:</div>
          <div className="font-mono text-xs break-all">{address}</div>
          <div className="text-gray-700 text-sm mt-2">Balance: <span className="font-semibold">{balance} ETH</span></div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}
