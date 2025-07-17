import { useState } from 'react';
import { callContract, sendContractTx } from '../utils/blockchain';

export function ContractInteractionForm() {
  const [address, setAddress] = useState('');
  const [abi, setAbi] = useState('');
  const [method, setMethod] = useState('');
  const [args, setArgs] = useState('');
  const [result, setResult] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWrite, setIsWrite] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');
    setTxHash('');
    setIsLoading(true);
    try {
      const parsedAbi = JSON.parse(abi);
      const parsedArgs = args ? JSON.parse(args) : [];
      if (isWrite) {
        const tx = await sendContractTx({ address, abi: parsedAbi, method, args: parsedArgs });
        setTxHash(tx.hash);
      } else {
        const res = await callContract({ address, abi: parsedAbi, method, args: parsedArgs });
        setResult(JSON.stringify(res));
      }
    } catch (err: any) {
      setError(err.message || 'Contract call failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Smart Contract Interaction</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder="Contract Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder="Contract ABI (JSON)"
          value={abi}
          onChange={e => setAbi(e.target.value)}
          required
          rows={3}
        />
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder="Method Name (e.g. balanceOf)"
          value={method}
          onChange={e => setMethod(e.target.value)}
          required
        />
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2"
          placeholder='Arguments (JSON array, e.g. ["0x123...", 1])'
          value={args}
          onChange={e => setArgs(e.target.value)}
        />
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm">
            <input type="checkbox" checked={isWrite} onChange={e => setIsWrite(e.target.checked)} className="mr-2" />
            Write (state-changing)
          </label>
          <button
            type="submit"
            className="py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (isWrite ? 'Sending...' : 'Calling...') : (isWrite ? 'Send Transaction' : 'Call Method')}
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-2 text-green-700 text-sm break-all">Result: {result}</div>
      )}
      {txHash && (
        <div className="mt-2 text-green-700 text-sm break-all">Transaction sent! Hash: {txHash}</div>
      )}
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </div>
  );
}
