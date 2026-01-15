import React, { useState } from 'react'
import { Coins, Rocket, Shield, Settings, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'
import { NEURA_TESTNET } from '../config/constants'

const TokenDeployPage: React.FC = () => {
  const { addTransaction } = useStore()
  const { isConnected, connect, address } = useWallet()
  
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [decimals, setDecimals] = useState('18')
  const [isMintable, setIsMintable] = useState(false)
  const [isBurnable, setIsBurnable] = useState(false)
  const [isPausable, setIsPausable] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedToken, setDeployedToken] = useState<{
    address: string
    name: string
    symbol: string
  } | null>(null)
  const [txModal, setTxModal] = useState<{
    isOpen: boolean
    status: 'pending' | 'success' | 'error'
    title: string
    message: string
    txHash?: string
  }>({
    isOpen: false,
    status: 'pending',
    title: '',
    message: '',
  })

  const handleDeploy = async () => {
    if (!isConnected || !tokenName || !tokenSymbol || !totalSupply) return

    setIsDeploying(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Deploying Token',
      message: `Deploying ${tokenName} (${tokenSymbol}) to Neura Testnet...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    const mockTokenAddress = `0x${Math.random().toString(16).slice(2, 42)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'deploy',
      status: 'success',
      timestamp: Date.now(),
      details: `Deployed ${tokenName} (${tokenSymbol}) at ${mockTokenAddress}`,
    })

    setDeployedToken({
      address: mockTokenAddress,
      name: tokenName,
      symbol: tokenSymbol,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Token Deployed!',
      message: `${tokenName} (${tokenSymbol}) has been successfully deployed`,
      txHash: mockTxHash,
    })

    setIsDeploying(false)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          Token Factory
        </h1>
        <p className="text-gray-400">Deploy your own ERC-20 token on Neura Testnet</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-glow text-center">
          <Rocket className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-sm font-medium">Instant Deploy</div>
          <div className="text-xs text-gray-400">~3 seconds</div>
        </div>
        <div className="card-glow text-center">
          <Shield className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-sm font-medium">Verified</div>
          <div className="text-xs text-gray-400">Auto-verified</div>
        </div>
        <div className="card-glow text-center">
          <Settings className="w-6 h-6 text-secondary mx-auto mb-2" />
          <div className="text-sm font-medium">Customizable</div>
          <div className="text-xs text-gray-400">Full control</div>
        </div>
      </div>

      {/* Deploy Form */}
      <div className="card-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Token Configuration</h3>
            <p className="text-sm text-gray-400">Configure your token parameters</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Token Name */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Token Name *</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g., My Awesome Token"
              className="input-field"
            />
          </div>

          {/* Token Symbol */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Token Symbol *</label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., MAT"
              maxLength={10}
              className="input-field"
            />
          </div>

          {/* Total Supply */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Total Supply *</label>
            <input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              placeholder="e.g., 1000000"
              className="input-field"
            />
          </div>

          {/* Decimals */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Decimals</label>
            <select
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              className="input-field"
            >
              <option value="18">18 (Standard)</option>
              <option value="8">8</option>
              <option value="6">6</option>
              <option value="0">0</option>
            </select>
          </div>

          {/* Features */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Token Features</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setIsMintable(!isMintable)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  isMintable
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface-light hover:border-primary/50'
                }`}
              >
                <div className="text-sm font-medium">Mintable</div>
                <div className="text-xs text-gray-400">Create more tokens</div>
              </button>
              <button
                onClick={() => setIsBurnable(!isBurnable)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  isBurnable
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface-light hover:border-primary/50'
                }`}
              >
                <div className="text-sm font-medium">Burnable</div>
                <div className="text-xs text-gray-400">Destroy tokens</div>
              </button>
              <button
                onClick={() => setIsPausable(!isPausable)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  isPausable
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface-light hover:border-primary/50'
                }`}
              >
                <div className="text-sm font-medium">Pausable</div>
                <div className="text-xs text-gray-400">Pause transfers</div>
              </button>
            </div>
          </div>

          {/* Preview */}
          {tokenName && tokenSymbol && totalSupply && (
            <div className="p-4 rounded-xl bg-surface-light/50 border border-border/50 space-y-2">
              <div className="text-sm font-medium text-gray-400 mb-2">Token Preview</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Name</span>
                <span>{tokenName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Symbol</span>
                <span>{tokenSymbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Supply</span>
                <span>{parseFloat(totalSupply).toLocaleString()} {tokenSymbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Decimals</span>
                <span>{decimals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Features</span>
                <span>
                  {[isMintable && 'Mintable', isBurnable && 'Burnable', isPausable && 'Pausable']
                    .filter(Boolean)
                    .join(', ') || 'Standard'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Owner</span>
                <span className="font-mono text-xs">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={isConnected ? handleDeploy : connect}
            disabled={isConnected && (!tokenName || !tokenSymbol || !totalSupply || isDeploying)}
            className="btn-primary w-full"
          >
            {!isConnected
              ? 'Connect Wallet'
              : isDeploying
              ? 'Deploying...'
              : !tokenName || !tokenSymbol || !totalSupply
              ? 'Fill Required Fields'
              : 'Deploy Token'}
          </button>
        </div>
      </div>

      {/* Deployed Token Info */}
      {deployedToken && (
        <div className="card-glow mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Token Deployed Successfully!</h3>
              <p className="text-sm text-gray-400">{deployedToken.name} ({deployedToken.symbol})</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-light border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Contract Address</div>
                <div className="font-mono text-sm">{deployedToken.address}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(deployedToken.address)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`${NEURA_TESTNET.blockExplorer}/address/${deployedToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal({ ...txModal, isOpen: false })}
        status={txModal.status}
        title={txModal.title}
        message={txModal.message}
        txHash={txModal.txHash}
      />
    </div>
  )
}

export default TokenDeployPage
