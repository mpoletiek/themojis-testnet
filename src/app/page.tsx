/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client'
import {useState,useEffect,useCallback} from 'react'
import { useContext } from 'react';
import Image from 'next/image';
import { Toaster, toaster } from "@/components/ui/toaster"
import { buildTransactionUrl, shortenAddress, sortedQuaiShardNames } from '@/utils/quaisUtils';
import { quais } from 'quais';
import TheMojis from '../../artifacts/contracts/TheMojis.sol/TheMojis.json';
import { StateContext } from '@/app/store';
import ConnectButton from '@/components/ui/connectButton';
import { useGetAccounts } from '@/utils/wallet';
import OwnerControls from '@/components/OwnerControls';
import TransferNFT from '@/components/TransferNFT';
import Footer from '@/components/ui/footer';
import { BLOCKEXPLORER_URL, DEPLOYED_CONTRACT } from '@/utils/constants';

export default function Mint() {
  useGetAccounts();
  const [nftName, setNFTName] = useState('NFT Name');
  const [symbol, setSymbol] = useState('NFT Symbol');
  const [isOwner, setIsOwner] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const [baseTokenURI, setBaseTokenURI] = useState('');
  const [tokenIdInput, setTokenIdInput] = useState('');
  const [retrievedTokenURI, setRetrievedTokenURI] = useState('');
  const [maxMintPerAddress, setMaxMintPerAddress] = useState(0);
  const [nftBalance, setNFTBalance] = useState(0);
  const [tokenSupply, setTokenSupply] = useState(Number(null));
  const [remainingSupply, setRemainingSupply] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { web3Provider, account } = useContext(StateContext);
  const blockExplorerUrl = BLOCKEXPLORER_URL;

  // Emoji list for display
  const emojis = [
    '1F603.png', '1F604.png', '1F605.png', '1F608.png', '1F60B.png', '1F60D.png', '1F60E.png',
    '1F616.png', '1F618.png', '1F61A.png', '1F61D.png', '1F623.png', '1F624.png', '1F629.png',
    '1F62C.png', '1F62E.png', '1F631.png', '1F633.png', '1F680.png', '1F681.png', '1F697.png',
    '1F6A2.png', '1F923.png', '1F924.png', '1F928.png', '1F929.png', '1F92D.png', '1F92F.png',
    '1F970.png', '1F973.png', '1F974.png', '1F975.png', '1F976.png', '1F9CC.png', '1F9D0.png',
    '1F9D9-1F3FB.png', '1F9FD.png', '1FA77.png', '1FABE.png', '1FADF.png', '1FAE0.png', '1FAE1.png',
    '1F47A.png', '1F47B.png', '1F47D.png', '1F383.png', '1F386.png', '1F3A8.png', '1F404.png',
    '1F431.png', '1F436.png', '1F469-200D-1F9BD.png', '1F9CE-200D-27A1-FE0F.png', '2648.png'
  ];
  const contractAddress = DEPLOYED_CONTRACT; // Change this to your contract address


  const callContract = useCallback(async (type: string) => {
	if(type == 'balanceOf') {
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const balance = await ERC721contract.balanceOf(account?.addr);
  	if(balance){
    	console.log("Balance: "+balance);
    	setNFTBalance(Number(balance));
  	}
  	return balance;
	}
	else if(type == 'symbol'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const contractSymbol = await ERC721contract.symbol();
  	if(contractSymbol){
    	setSymbol(contractSymbol);
  	}
  	return contractSymbol;
	}
	else if(type == 'name'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const contractName = await ERC721contract.name();
  	if(contractName){
    	setNFTName(contractName);
  	}
  	return contractName;
	}
	else if(type == 'owner'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const contractOwner = await ERC721contract.owner();
  	if(account?.addr == contractOwner){
    	setIsOwner(true);
  	}
  	return contractOwner;
	}
	else if(type == 'tokenid'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const tokenid = await ERC721contract.tokenIds();
  	if(tokenid >= 0){
    	console.log("tokenid: "+tokenid);
    	setTokenId(tokenid);
  	}
	}
	else if(type == 'supply'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const supply = await ERC721contract.supply();
		const numSupply = Number(supply) + 1;
  	if(supply){
    	console.log("supply: "+supply);
    	setTokenSupply(numSupply);
  	}
  	return supply;
	}
	else if(type == 'mint'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
    	const contractTransaction = await ERC721contract.mint(account?.addr);
    	const txReceipt = await contractTransaction.wait();
    	return Promise.resolve({ result: txReceipt, method: "Mint" });
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type=='baseTokenURI'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const uri = await ERC721contract.baseTokenURI();
  	if(uri){
    	setBaseTokenURI(uri);
  	}
  	return uri;
	}
	else if(type=='tokenURI'){
  	try {
    	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
    	if(tokenIdInput.trim() !== ''){
      	const tokenId = parseInt(tokenIdInput);
      	console.log("Fetching Token URI for ID: "+tokenId);
      	const tokenURI = await ERC721contract.tokenURI(tokenId);
      	setRetrievedTokenURI(tokenURI);
      	return Promise.resolve({ result: tokenURI, method: "tokenURI" });
    	}
  	} catch (err) {
    	return Promise.reject(err);
  	}
	}
	else if(type=='maxMintPerAddress'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const maxMint = await ERC721contract.maxMintPerAddress();
  	if(maxMint){
    	setMaxMintPerAddress(Number(maxMint));
  	}
  	return maxMint;
	}
	else if(type == 'paused'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const pausedStatus = await ERC721contract.paused();
  	setIsPaused(pausedStatus);
  	return pausedStatus;
	}
	else if(type == 'whitelist'){
  	const ERC721contract = new quais.Contract(contractAddress, TheMojis.abi, await web3Provider.getSigner());
  	const whitelistStatus = await ERC721contract.whitelist(account?.addr);
  	setIsWhitelisted(whitelistStatus);
  	return whitelistStatus;
	}
  }, [contractAddress, web3Provider, account, tokenIdInput]);





  // HANDLE MINT
  const handleMint = async () => {
	toaster.promise(
  	callContract('mint'),
  	{
    	loading: {
      	title: 'Broadcasting Transaction',
      	description: '',
    	},
    	success: ({result, method}) => (
      	{
      	title: 'Transaction Successful',
      	description: (
        	<>
          	{result.hash ? (
            	<a
              	className="underline"
              	href={buildTransactionUrl(result.hash)}
              	target="_blank"
            	>
              	View In Explorer
            	</a>
          	) : (
            	<p>
              	{method} : {result}
            	</p>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'An unknown error occurred',
      	duration: 10000,
    	}),
  	}
	);
  };

  // HANDLE FETCH TOKEN URI
  const handleFetchTokenURI = async () => {
	setRetrievedTokenURI(''); // Clear previous result
	toaster.promise(
  	callContract('tokenURI'),
  	{
    	loading: {
      	title: 'Fetching Token URI',
      	description: 'Retrieving metadata from blockchain...',
    	},
    	success: ({result}) => (
      	{
      	title: 'Token URI Retrieved',
      	description: (
        	<>
          	<p className="mb-2">Token ID: {tokenIdInput}</p>
          	{result && (
            	<a
              	className="underline text-blue-400 hover:text-blue-300"
              	href={result}
              	target="_blank"
              	rel="noopener noreferrer"
            	>
              	View Metadata
            	</a>
          	)}
        	</>
      	),
      	duration: 10000,
    	}),
    	error: (error: any) => ({
      	title: 'Error',
      	description: error.reason || error.message || 'Token not found or invalid ID',
      	duration: 10000,
    	}),
  	}
	);
  };



  useEffect(()=>{
	if(account && web3Provider){
  	callContract('owner');
  	callContract('tokenid');
  	callContract('supply');
  	callContract('balanceOf');
  	callContract('symbol');
  	callContract('name');
  	callContract('baseTokenURI');
  	callContract('maxMintPerAddress');
  	callContract('paused');
  	callContract('whitelist');
	}
	if((Number(tokenId) >= 0) && (Number(tokenSupply) >= 0)){
  	if(tokenId == 0){
    	setRemainingSupply(Number(tokenSupply));
  	} else {
    	setRemainingSupply((Number(tokenSupply) - (Number(tokenId))));
  	}
  	console.log("Remaining Supply: "+remainingSupply);
	}
  }, [account, web3Provider, tokenId, tokenSupply, callContract, remainingSupply]);

  // Check if user can mint based on pause and whitelist status
  const canMint = () => {
    if (!account) return false;
    if (remainingSupply <= 0) return false;
    if (maxMintPerAddress > 0 && nftBalance >= maxMintPerAddress) return false;
    
    // If paused, user must be whitelisted
    if (isPaused) {
      return isWhitelisted;
    }
    
    // If not paused, anyone can mint
    return true;
  };

  // Get mint status message
  const getMintStatusMessage = () => {
    if (!account) return "Connect your wallet to start minting";
    if (remainingSupply <= 0) return "Collection sold out";
    if (maxMintPerAddress > 0 && nftBalance >= maxMintPerAddress) return "Maximum mint limit reached";
    if (isPaused && !isWhitelisted) return "Minting is paused - Whitelist only";
    if (isPaused && isWhitelisted) return "Minting is paused - You are whitelisted";
    return "Ready to mint";
  };

  return (
	<>
  	<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-orange-900 to-pink-900 relative overflow-x-hidden">
    	{/* Enhanced Background Pattern */}
    	<div className="absolute inset-0 opacity-30">
      	<div 
        	className="absolute inset-0 w-full h-full"
        	style={{
          	backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b6b' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='60' cy='60' r='1'/%3E%3C/g%3E%3Cg fill='%234ecdc4' fill-opacity='0.08'%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          	backgroundRepeat: 'repeat'
        	}}
      	></div>
    	</div>
    	
    	{/* Gradient overlay for depth - lighter at top for title visibility */}
    	<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/10"></div>
    	
    	{/* Floating Elements */}
    	<div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
    	<div className="absolute top-40 right-20 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
    	<div className="absolute bottom-40 left-1/4 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
    	<div className="absolute top-60 right-1/3 w-16 h-16 bg-coral-500/15 rounded-full blur-lg animate-pulse delay-500"></div>
    	<div className="absolute bottom-20 right-10 w-28 h-28 bg-green-500/10 rounded-full blur-2xl animate-pulse delay-1500"></div>
    	
    	{/* Main Content Container */}
    	<div className="flex flex-col items-center justify-center z-10 min-h-screen">
      	{/* Hero Section */}
      	<div className="flex items-center justify-center pt-12 pb-8">
        	<div className="max-w-6xl mx-auto px-6">
          	<div className="text-center mb-12">
            	<div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-coral-500/20 border border-pink-500/30 rounded-full mb-4 animate-fade-in-up">
              	<span className="text-pink-400 text-xs font-medium">🚀 Live on Quai Network</span>
            	</div>
            	<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up">
              	<span className="gradient-text">The Mojis</span>
              	<span className="text-white"> NFT Collection</span>
            	</h1>
            	<p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 animate-fade-in-up">
              	Mint, trade, and discover unique collection of Emojis on the fastest blockchain network
            	</p>
            	
            	{/* Emoji Preview */}
            	<div className="flex justify-center items-center space-x-4 mb-6 animate-fade-in-up">
              	<Image src="/mojis/1F603.png" alt="Happy" width={48} height={48} className="hover:scale-110 transition-transform duration-300" />
              	<Image src="/mojis/1F60D.png" alt="Heart Eyes" width={48} height={48} className="hover:scale-110 transition-transform duration-300" />
              	<Image src="/mojis/1F680.png" alt="Rocket" width={48} height={48} className="hover:scale-110 transition-transform duration-300" />
              	<Image src="/mojis/1F47A.png" alt="Alien" width={48} height={48} className="hover:scale-110 transition-transform duration-300" />
              	<Image src="/mojis/1F383.png" alt="Halloween" width={48} height={48} className="hover:scale-110 transition-transform duration-300" />
            	</div>
            	
            	{/* Connection Status */}
            	<div className="animate-fade-in-up">
              	{account ? (
                	<div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  	<div className="flex items-center space-x-2">
                    	<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    	<span className="text-green-400 font-semibold text-sm">Connected</span>
                  	</div>
                  	<div className="w-px h-4 bg-white/20"></div>
                  	<span className="text-gray-300 text-sm">
                    	{sortedQuaiShardNames[account.shard].name} • {shortenAddress(account.addr)}
                  	</span>
                	</div>
              	) : (
                	<div className="inline-flex items-center space-x-4 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  	<div className="flex items-center space-x-2">
                    	<div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    	<span className="text-red-400 font-semibold text-sm">Disconnected</span>
                  	</div>
                  	<div className="w-px h-4 bg-white/20"></div>
                  	<span className="text-gray-400 text-sm">Connect your wallet to get started</span>
                	</div>
              	)}
            	</div>
          	</div>
        	</div>
      	</div>

      	{/* Scrolling Emoji Bar */}
      	<div className="w-full mb-12 overflow-hidden">
        	<div className="flex animate-scroll">
          	{/* First set of emojis */}
          	{emojis.map((emoji, index) => (
            	<div key={`first-${index}`} className="flex-shrink-0 mx-2">
              		<Image 
                		src={`/mojis/${emoji}`} 
                		alt={`Emoji ${index + 1}`}
                		width={64}
                		height={64}
                		className="hover:scale-110 transition-transform duration-300"
              		/>
            	</div>
          	))}
          	{/* Duplicate set for seamless loop */}
          	{emojis.map((emoji, index) => (
            	<div key={`second-${index}`} className="flex-shrink-0 mx-2">
              		<Image 
                		src={`/mojis/${emoji}`} 
                		alt={`Emoji ${index + 1}`}
                		width={64}
                		height={64}
                		className="hover:scale-110 transition-transform duration-300"
              		/>
            	</div>
          	))}
        	</div>
      	</div>

      	{/* Collection Overview Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="glass-card rounded-2xl p-8 animate-fade-in-up">
          	<div className="text-center mb-8">
            	<div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full mb-4">
              	<span className="text-cyan-400 font-semibold text-sm">📊 Collection Stats</span>
            	</div>
            	<h2 className="text-3xl font-bold gradient-text mb-3">
              	{account ? (nftName || 'Loading...') : 'Connect Wallet to View Collection'}
            	</h2>
            	<p className="text-lg text-gray-300">
              	<span className="text-gray-400"></span>{' '}
              	{account ? (
                	<a 
                  		href={`${blockExplorerUrl}/token/${contractAddress}`} 
                  		target="_blank" 
                  		rel="noopener noreferrer"
                  		className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                	>
                  		{symbol || 'Loading...'}
                	</a>
              	) : (
                	<span className="text-gray-500">Connect wallet to view</span>
              	)}
            	</p>
          	</div>

          	{/* Stats Grid */}
          	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{account ? (Number(tokenSupply) > 0 ? Number(tokenSupply).toLocaleString() : '0') : '--'}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Total Supply</div>
            	</div>
            	<div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
              	<div className="text-2xl font-bold text-white mb-1">
                	{account ? (maxMintPerAddress > 0 ? maxMintPerAddress.toLocaleString() : '0') : '--'}
              	</div>
              	<div className="text-gray-400 font-medium text-sm">Max Per Address</div>
            	</div>
          	</div>

          	{/* Base URI Display */}
          	{account && baseTokenURI && (
            	<div className="p-4 bg-black/20 rounded-xl border border-white/10">
              	<div className="text-xs text-gray-400 mb-2 font-medium">Base Token URI</div>
              	<a 
                	href={baseTokenURI} 
                	target="_blank" 
                	rel="noopener noreferrer"
                	className="text-blue-400 hover:text-blue-300 transition-colors text-xs break-all block"
              	>
                	{baseTokenURI}
              	</a>
            	</div>
          	)}

          	{/* Contract Address */}
          	<div className="p-4 bg-black/20 rounded-xl border border-white/10 mt-4">
            	<div className="text-xs text-gray-400 mb-2 font-medium">Contract Address</div>
            	<div className="flex items-center gap-2">
              	<a
                	href={`${blockExplorerUrl}/address/${contractAddress}`}
                	target="_blank"
                	rel="noopener noreferrer"
                	className="text-blue-400 hover:text-blue-300 transition-colors text-xs break-all"
              	>
                	{contractAddress}
              	</a>
              	<button
                	onClick={() => {
                  	navigator.clipboard.writeText(contractAddress);
                  	setCopied(true);
                  	setTimeout(() => setCopied(false), 2000);
                	}}
                	className="flex-shrink-0 px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-xs text-gray-300 transition-all duration-200"
              	>
                	{copied ? '✓ Copied' : '📋 Copy'}
              	</button>
            	</div>
          	</div>

          	{/* Connect Wallet Message */}
          	{!account && (
            	<div className="text-center py-8">
              	<div className="mb-6">
                	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  		<span className="text-3xl">🔗</span>
                	</div>
                	<p className="text-gray-400 text-lg mb-6">Connect your wallet to view collection details</p>
              	</div>
              	<ConnectButton />
            	</div>
          	)}
        	</div>
      	</div>

      	{/* Emoji Collection Preview */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="glass-card rounded-2xl p-8 animate-fade-in-up">
          	<div className="text-center mb-8">
            	<div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-pink-500/20 border border-emerald-500/30 rounded-full mb-4">
              		<span className="text-emerald-400 font-semibold text-sm">🎨 Collection Preview</span>
            	</div>
            	<h2 className="text-3xl font-bold gradient-text mb-3">What You&apos;ll Mint</h2>
            	<p className="text-lg text-gray-300">Discover the amazing emoji collection available for minting</p>
          	</div>
          	
          	{/* Emoji Grid */}
          	<div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            	{emojis.slice(0, 24).map((emoji, index) => (
              		<div key={index} className="group relative">
                		<Image 
                  			src={`/mojis/${emoji}`} 
                  			alt={`Emoji ${index + 1}`}
                  			width={64}
                  			height={64}
                  			className="w-full h-16 group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                		/>
                		<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  			<span className="text-white text-xs font-semibold"></span>
                		</div>
              		</div>
            	))}
          	</div>
          	
          	
        	</div>
      	</div>

      	{/* Main Action Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          	{/* User Portfolio Card */}
          	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            	<div className="text-center mb-6">
              	<div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full mb-4">
                	<span className="text-blue-400 font-semibold text-sm">👤 Your Portfolio</span>
              	</div>
              	<h3 className="text-2xl font-bold text-white mb-3">Personal Stats</h3>
            	</div>

            	{account ? (
              	<div className="space-y-6">
                	<div className="grid grid-cols-2 gap-4">
                  	<div className="text-center p-4 bg-gradient-to-br from-pink-500/20 to-coral-500/10 rounded-xl border border-pink-500/30">
                    	<div className="text-2xl font-bold text-white mb-1">
                      		{remainingSupply > 0 ? remainingSupply.toLocaleString() : '0'}
                    	</div>
                    	<div className="text-gray-400 font-medium text-sm">Available to Mint</div>
                  	</div>
                  	<div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30">
                    	<div className="text-2xl font-bold text-white mb-1">
                      		{nftBalance > 0 ? nftBalance.toLocaleString() : '0'}
                    	</div>
                    	<div className="text-gray-400 font-medium text-sm">You Own</div>
                  	</div>
                	</div>

                	{remainingSupply > 0 ? (
                  	<div className="space-y-3">
                    	<div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl">
                      		<p className="text-green-400 font-semibold text-lg">
                        		🎉 {remainingSupply.toLocaleString()} NFTs available to mint!
                      		</p>
                    	</div>
                    	{maxMintPerAddress > 0 && (
                      		<div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        		<p className="text-blue-400 text-sm">
                          			Mint Limit: {nftBalance}/{maxMintPerAddress} NFT{maxMintPerAddress > 1 ? 's' : ''}
                        		</p>
                        		{nftBalance >= maxMintPerAddress ? (
                          			<p className="text-orange-400 text-xs mt-1 font-semibold">
                            			⚠️ You&apos;ve reached your mint limit
                          			</p>
                        		) : (
                          			<p className="text-gray-400 text-xs mt-1">
                            			You can mint {maxMintPerAddress - nftBalance} more NFT{(maxMintPerAddress - nftBalance) !== 1 ? 's' : ''}
                          			</p>
                        		)}
                      		</div>
                    	)}
                  	</div>
                	) : (
                  	<div className="text-center p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl">
                    	<p className="text-red-300 font-semibold text-lg">
                      		⚠️ Collection sold out
                    	</p>
                  	</div>
                	)}
              	</div>
            	) : (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    	<span className="text-3xl">🔗</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to view your portfolio</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>

          	{/* Minting Card */}
          	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
            	<div className="text-center mb-6">
              	<div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-full mb-4">
                	<span className="text-orange-400 font-semibold text-sm">🚀 Mint NFT</span>
              	</div>
              	<h3 className="text-2xl font-bold text-white mb-3">Mint Your NFT</h3>
              	<p className="text-gray-400 text-base">Get your unique digital collectible</p>
              	
              	
            	</div>

            	{account ? (
              	<div className="space-y-6">
                	{/* Status Display */}
                	<div className="text-center space-y-3">
                  	<div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    		isPaused 
                      		? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' 
                      		: 'bg-green-500/10 border border-green-500/20 text-green-400'
                  	}`}>
                    	{isPaused ? '⏸️ Minting Paused' : '▶️ Minting Active'}
                  	</div>
                  	
                  	{isPaused && (
                    	<div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      		isWhitelisted 
                        		? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                        		: 'bg-red-500/10 border border-red-500/20 text-red-400'
                    	}`}>
                      	{isWhitelisted ? '✅ You are whitelisted' : '❌ You are not whitelisted'}
                    	</div>
                  	)}
                	</div>

                	{(remainingSupply > 0) ? (
                  	<>
                    	{/* Check if user can mint */}
                    	{!canMint() ? (
                      	<div className="text-center py-8">
                        	<div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          		<span className="text-3xl">🚫</span>
                        	</div>
                        	<p className="text-orange-300 text-lg font-semibold mb-3">{getMintStatusMessage()}</p>
                        	{maxMintPerAddress > 0 && nftBalance >= maxMintPerAddress && (
                          		<p className="text-gray-400 text-base">
                            			You have already minted {nftBalance} of {maxMintPerAddress} allowed NFT{maxMintPerAddress > 1 ? 's' : ''}
                          		</p>
                        	)}
                      	</div>
                    	) : (
                      	<>
                        	<button
                          	className="w-full bg-gradient-to-r from-pink-500 to-coral-600 hover:from-pink-600 hover:to-coral-700 text-white text-lg font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/25"
                          	onClick={() => handleMint()}
                        	>
                          	🚀 Mint NFT (FREE)
                        	</button>
                        	{maxMintPerAddress > 0 && (
                          	<div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            	<p className="text-blue-400 text-sm">
                              		You can mint up to {maxMintPerAddress} NFT{maxMintPerAddress > 1 ? 's' : ''} per address
                            	</p>
                            	<p className="text-gray-400 text-xs mt-1">
                              		You currently own {nftBalance} NFT{nftBalance !== 1 ? 's' : ''}
                            	</p>
                          	</div>
                        	)}
                      	</>
                    	)}
                  	</>
                	) : (
                  	<div className="text-center py-8">
                    	<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      		<span className="text-3xl">⚠️</span>
                    	</div>
                    	<p className="text-red-300 text-lg font-semibold">No NFTs available to mint</p>
                  	</div>
                	)}
              	</div>
            	) : (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    		<span className="text-3xl">🔐</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to start minting</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>
        	</div>
      	</div>

      	{/* Token Lookup Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<div className="glass-card rounded-2xl p-6 animate-fade-in-up">
          	<div className="text-center mb-6">
            	<div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-coral-500/20 border border-indigo-500/30 rounded-full mb-4">
              	<span className="text-indigo-400 font-semibold text-sm">🔍 Token Lookup</span>
            	</div>
            	<h3 className="text-2xl font-bold text-white mb-3">Explore Token Metadata</h3>
            	<p className="text-gray-400 text-base">Look up specific token URIs and metadata</p>
          	</div>

          	<div className="max-w-xl mx-auto">
            	<div className="space-y-4">
              	<label className="block text-base font-medium text-gray-300">Enter Token ID</label>
              	<div className="flex flex-col sm:flex-row gap-3">
                	<input
                  	onChange={e => setTokenIdInput(e.target.value)}
                  	type="number"
                  	className="input-modern flex-1 py-3 text-base"
                  	placeholder="Enter token ID (e.g., 0, 1, 2...)"
                  	value={tokenIdInput}
                	/>
                	<button
                  	className="bg-gradient-to-r from-indigo-500 to-coral-600 hover:from-indigo-600 hover:to-coral-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  	onClick={() => handleFetchTokenURI()}
                  	disabled={!tokenIdInput.trim()}
                	>
                  	🔍 Lookup
                	</button>
              	</div>
            	</div>

            	{retrievedTokenURI && (
              	<div className="mt-6 p-4 bg-gradient-to-br from-indigo-500/20 to-coral-500/20 rounded-xl border border-indigo-500/30">
                	<p className="text-xs text-gray-400 mb-3 font-medium">Token URI for ID: {tokenIdInput}</p>
                	<div className="p-3 bg-black/30 rounded-lg border border-white/10">
                  	<a
                    	href={retrievedTokenURI}
                    	target="_blank"
                    	rel="noopener noreferrer"
                    	className="text-blue-400 hover:text-blue-300 transition-colors text-xs break-all block"
                  	>
                    	{retrievedTokenURI}
                  	</a>
                	</div>
              	</div>
            	)}

            	{!account && (
              	<div className="text-center py-8">
                	<div className="mb-6">
                  	<div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    		<span className="text-3xl">🔐</span>
                  	</div>
                  	<p className="text-gray-400 text-lg mb-6">Connect your wallet to lookup token URIs</p>
                	</div>
                	<ConnectButton />
              	</div>
            	)}
          	</div>
        	</div>
      	</div>

      	{/* Transfer NFT Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<TransferNFT
          	contractAddress={contractAddress}
          	account={account}
        	/>
      	</div>

      	{/* Owner Controls Section */}
      	<div className="max-w-6xl mx-auto px-6 mb-12">
        	<OwnerControls 
          	contractAddress={contractAddress}
          	isOwner={isOwner}
          	account={account}
        	/>
      	</div>
    	</div>
  	</div>
		<Footer />
  	<Toaster/>
	</>
  )

}