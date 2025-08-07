import { EthereumWallet } from '../EthereumWallet';
import { SendEthForm } from '../SendEthForm';
import { ContractInteractionForm } from '../ContractInteractionForm';
import { NetworkInfo } from '../NetworkInfo';
import { LocalBlockchain } from '../LocalBlockchain';
import { Network } from 'lucide-react';
import { motion } from 'framer-motion';

export function BlockchainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-6"
              >
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Network className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Blockchain
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 max-w-2xl mx-auto"
              >
                Interact with Ethereum in real time
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
}

