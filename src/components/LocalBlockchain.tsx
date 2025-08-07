import { useEffect, useState } from 'react';
import { Boxes } from 'lucide-react';
import { blockchain, Block, onBlockAdded, offBlockAdded } from '../utils/blockchain';

export function LocalBlockchain() {
  const [data, setData] = useState('');
  const [chain, setChain] = useState<Block[]>(blockchain.getChain());
  const [isValid, setIsValid] = useState(true);

  const addBlock = () => {
    blockchain.addBlock(data);
    setData('');
  };

  const validate = () => {
    setIsValid(blockchain.isChainValid());
  };

  useEffect(() => {
    const listener = (b: Block) => setChain((prev) => [...prev, b]);
    onBlockAdded(listener);
    return () => offBlockAdded(listener);
  }, []);

  return (
    <div className="glassy-card p-6 rounded-2xl border border-white/30 shadow-xl mb-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
        <Boxes className="h-5 w-5 text-gray-700" />
        <span>Local Blockchain</span>
      </h2>
      <div className="flex space-x-2">
        <input
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Block data"
          className="flex-grow border border-gray-200 rounded-lg px-3 py-2"
        />
        <button onClick={addBlock} className="px-4 py-2 rounded-lg bg-blue-600 text-white" disabled={!data}>Add</button>
        <button onClick={validate} className="px-4 py-2 rounded-lg bg-green-600 text-white">Validate</button>
      </div>
      {!isValid && <div className="text-red-600 text-sm">Chain is invalid!</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="p-2">#</th>
              <th className="p-2">Hash</th>
              <th className="p-2">Data</th>
              <th className="p-2">Prev</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((b) => (
              <tr key={b.index} className="border-b">
                <td className="p-2 font-mono text-xs">{b.index}</td>
                <td className="p-2 font-mono text-xs break-all max-w-xs">{b.hash.slice(0, 16)}...</td>
                <td className="p-2 font-mono text-xs break-all max-w-xs">{JSON.stringify(b.data)}</td>
                <td className="p-2 font-mono text-xs break-all max-w-xs">{b.previousHash.slice(0, 16)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
