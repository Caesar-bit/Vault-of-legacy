import { EthereumWallet } from '../EthereumWallet';
import { SendEthForm } from '../SendEthForm';
import { ContractInteractionForm } from '../ContractInteractionForm';

export function BlockchainPage() {
  return (
    <div className="space-y-8">
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Blockchain</h1>
          <p className="mt-2 text-lg text-gray-700">Interact with Ethereum: connect wallet, send ETH, and call smart contracts</p>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>
      <EthereumWallet />
      <SendEthForm />
      <ContractInteractionForm />
    </div>
  );
}
