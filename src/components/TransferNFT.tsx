/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import { useState, useContext } from 'react';
import { toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, validateAddress } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TheMojis from '../../artifacts/contracts/TheMojis.sol/TheMojis.json';
import { StateContext } from '@/app/store';

interface TransferNFTProps {
  contractAddress: string;
  account: any;
}

export default function TransferNFT({ contractAddress, account }: TransferNFTProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const { web3Provider } = useContext(StateContext);

  const handleTransfer = async () => {
    toaster.promise(
      (async () => {
        const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
        const contractTransaction = await ERC721contract.transferFrom(
          account.addr,
          recipientAddress,
          parseInt(tokenId)
        );
        const txReceipt = await contractTransaction.wait();
        return Promise.resolve({ result: txReceipt, method: "Transfer" });
      })(),
      {
        loading: {
          title: 'Broadcasting Transfer',
          description: `Transferring NFT #${tokenId}...`,
        },
        success: (data: any) => {
          setRecipientAddress('');
          setTokenId('');
          return {
            title: 'Transfer Successful',
            description: (
              <>
                {data?.result?.hash ? (
                  <a
                    className="underline"
                    href={buildTransactionUrl(data.result.hash)}
                    target="_blank"
                  >
                    View In Explorer
                  </a>
                ) : (
                  <p>{data?.method} : {data?.result}</p>
                )}
              </>
            ),
            duration: 10000,
          };
        },
        error: (error: any) => ({
          title: 'Transfer Failed',
          description: error.reason || error.message || 'An unknown error occurred',
          duration: 10000,
        }),
      }
    );
  };

  if (!account) {
    return null;
  }

  const isValid = recipientAddress.trim() !== '' && validateAddress(recipientAddress) && tokenId.trim() !== '';

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full mb-4">
          <span className="text-purple-400 font-semibold text-sm">📤 Transfer NFT</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Transfer Your NFT</h3>
        <p className="text-gray-400 text-base">Send an NFT you own to another address</p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div className="space-y-3">
          <label className="block text-base font-medium text-gray-300">Recipient Address</label>
          <input
            onChange={e => setRecipientAddress(e.target.value)}
            type="text"
            className="input-modern w-full py-3 text-base"
            placeholder="Enter recipient wallet address"
            value={recipientAddress}
          />
          {recipientAddress.trim() !== '' && !validateAddress(recipientAddress) && (
            <p className="text-red-400 text-xs">Invalid address</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-base font-medium text-gray-300">Token ID</label>
          <input
            onChange={e => setTokenId(e.target.value)}
            type="number"
            className="input-modern w-full py-3 text-base"
            placeholder="Enter token ID to transfer"
            value={tokenId}
          />
        </div>

        <button
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-lg font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          onClick={handleTransfer}
          disabled={!isValid}
        >
          📤 Transfer NFT
        </button>
      </div>
    </div>
  );
}
