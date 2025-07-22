import { EthereumWallet } from '../EthereumWallet';
import { SendEthForm } from '../SendEthForm';
import { ContractInteractionForm } from '../ContractInteractionForm';
import { NetworkInfo } from '../NetworkInfo';
import { LocalBlockchain } from '../LocalBlockchain';

export function BlockchainPage() {
  return (
    <div className="space-y-8">
      <div
        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden"
        style={{ background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)' }}
      >
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Blockchain</h1>
          <p className="mt-2 text-lg text-gray-700">Interact with Ethereum in real time</p>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <NetworkInfo />
          <EthereumWallet />
          <SendEthForm />
        </div>
        <div className="space-y-6">
          <ContractInteractionForm />
          <LocalBlockchain />
        </div>
      </div>
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}
