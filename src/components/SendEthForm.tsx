import { useState } from 'react';
import { Send } from 'lucide-react';
import { sendEth } from '../utils/blockchain';

export function SendEthForm() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    setIsLoading(true);
    try {
      const tx = await sendEth({ to, amount });
      setTxHash(tx.hash);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6 space-y-1">
      <h2 className="text-xl font-bold mb-2 text-gray-900 flex items-center space-x-2">
        <Send className="h-5 w-5 text-gray-700" />
        <span>Send ETH</span>
      </h2>
      <form className="space-y-4" onSubmit={handleSend}>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder="Recipient Address"
          value={to}
          onChange={e => setTo(e.target.value)}
          required
        />
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          type="number"
          min="0"
          step="any"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send ETH'}
        </button>
      </form>
      {txHash && (
        <div className="mt-2 text-green-700 text-sm break-all">Transaction sent! Hash: {txHash}</div>
      )}
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </div>
  );
}
