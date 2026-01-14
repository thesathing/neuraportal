import React, { useState } from 'react'
import { Plus, Minus, Droplets, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react'
import TokenSelector from '../components/TokenSelector'
import TransactionModal from '../components/TransactionModal'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'

interface Pool {
  id: string
  token0: { symbol: string; name: string; address: string; decimals: number; balance: string }
  token1: { symbol: string; name: string; address: string; decimals: number; balance: string }
  reserve0: string
  reserve1: string
  totalLiquidity: string
  userLiquidity: string
  apr: number
  volume24h: string
  fees24h: string
}

const mockPools: Pool[] = [
  {
    id: '1',
    token0: { symbol: 'ANKR', name: 'Neura Native Token', address: '0x0000000000000000000000000000000000000000', decimals: 18, balance: '0' },
    token1: { symbol: 'ztUSD', name: 'ztUSD Stablecoin', address: '0x9423c6C914857e6DaAACe3b585f4640231505128', decimals: 18, balance: '0' },
    reserve0: '125000',
    reserve1: '250000',
    totalLiquidity: '500000',
    userLiquidity: '1250',
    apr: 45.2,
    volume24h: '125000',
    fees24h: '375',
  },
  {
    id: '2',
    token0: { symbol: 'ztUSD', name: 'ztUSD Stablecoin', address: '0x9423c6C914857e6DaAACe3b585f4640231505128', decimals: 18, balance: '0' },
    token1: { symbol: 'USDT', name: 'Tether USD', address: '0x3A631ee99eF7fE2D248116982b14e7615ac77502', decimals: 18, balance: '0' },
    reserve0: '500000',
    reserve1: '500000',
    totalLiquidity: '1000000',
    userLiquidity: '0',
    apr: 12.5,
    volume24h: '250000',
    fees24h: '750',
  },
  {
    id: '3',
    token0: { symbol: 'wANKR', name: 'Wrapped ANKR', address: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8', decimals: 18, balance: '0' },
    token1: { symbol: 'ANKR', name: 'Neura Native Token', address: '0x0000000000000000000000000000000000000000', decimals: 18, balance: '0' },
    reserve0: '75000',
    reserve1: '75000',
    totalLiquidity: '150000',
    userLiquidity: '500',
    apr: 28.7,
    volume24h: '45000',
    fees24h: '135',
  },
]

const PoolPage: React.FC = () => {
  const { tokens, addTransaction } = useStore()
  const { isConnected, connect } = useWallet()
  
  const [activeTab, setActiveTab] = useState<'pools' | 'add' | 'remove'>('pools')
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [token0, setToken0] = useState(tokens[0])
  const [token1, setToken1] = useState(tokens[1])
  const [amount0, setAmount0] = useState('')
  const [amount1, setAmount1] = useState('')
  const [removePercent, setRemovePercent] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const handleAddLiquidity = async () => {
    if (!isConnected || !amount0 || !amount1) return

    setIsProcessing(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Adding Liquidity',
      message: `Adding ${amount0} ${token0.symbol} and ${amount1} ${token1.symbol} to the pool...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'addLiquidity',
      status: 'success',
      timestamp: Date.now(),
      details: `Added ${amount0} ${token0.symbol} + ${amount1} ${token1.symbol} liquidity`,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Liquidity Added',
      message: `Successfully added liquidity to ${token0.symbol}/${token1.symbol} pool`,
      txHash: mockTxHash,
    })

    setIsProcessing(false)
    setAmount0('')
    setAmount1('')
  }

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !selectedPool) return

    setIsProcessing(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Removing Liquidity',
      message: `Removing ${removePercent}% of your liquidity from ${selectedPool.token0.symbol}/${selectedPool.token1.symbol} pool...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'removeLiquidity',
      status: 'success',
      timestamp: Date.now(),
      details: `Removed ${removePercent}% liquidity from ${selectedPool.token0.symbol}/${selectedPool.token1.symbol}`,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Liquidity Removed',
      message: `Successfully removed ${removePercent}% of your liquidity`,
      txHash: mockTxHash,
    })

    setIsProcessing(false)
    setSelectedPool(null)
    setActiveTab('pools')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          Liquidity Pools
        </h1>
        <p className="text-gray-400">Provide liquidity and earn trading fees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glow text-center">
          <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Total TVL</div>
          <div className="text-xl font-bold">$1.65M</div>
        </div>
        <div className="card-glow text-center">
          <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-sm text-gray-400">24h Volume</div>
          <div className="text-xl font-bold">$420K</div>
        </div>
        <div className="card-glow text-center">
          <Droplets className="w-6 h-6 text-secondary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Total Pools</div>
          <div className="text-xl font-bold">{mockPools.length}</div>
        </div>
        <div className="card-glow text-center">
          <Users className="w-6 h-6 text-accent mx-auto mb-2" />
          <div className="text-sm text-gray-400">Providers</div>
          <div className="text-xl font-bold">1,234</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'pools'
              ? 'bg-primary text-white'
              : 'bg-surface-light border border-border hover:border-primary/50'
          }`}
        >
          <Droplets className="w-4 h-4 inline mr-2" />
          All Pools
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'add'
              ? 'bg-primary text-white'
              : 'bg-surface-light border border-border hover:border-primary/50'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Liquidity
        </button>
        <button
          onClick={() => setActiveTab('remove')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'remove'
              ? 'bg-primary text-white'
              : 'bg-surface-light border border-border hover:border-primary/50'
          }`}
        >
          <Minus className="w-4 h-4 inline mr-2" />
          Remove
        </button>
      </div>

      {/* Pools List */}
      {activeTab === 'pools' && (
        <div className="space-y-4">
          {mockPools.map((pool) => (
            <div key={pool.id} className="card-glow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold border-2 border-surface">
                      {pool.token0.symbol.charAt(0)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold border-2 border-surface">
                      {pool.token1.symbol.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      TVL: ${parseFloat(pool.totalLiquidity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-400">APR</div>
                    <div className="font-semibold text-success">{pool.apr}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">24h Volume</div>
                    <div className="font-semibold">${parseFloat(pool.volume24h).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your Liquidity</div>
                    <div className="font-semibold">
                      {parseFloat(pool.userLiquidity) > 0
                        ? `$${parseFloat(pool.userLiquidity).toLocaleString()}`
                        : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setToken0(pool.token0)
                      setToken1(pool.token1)
                      setActiveTab('add')
                    }}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Add
                  </button>
                  {parseFloat(pool.userLiquidity) > 0 && (
                    <button
                      onClick={() => {
                        setSelectedPool(pool)
                        setActiveTab('remove')
                      }}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Liquidity */}
      {activeTab === 'add' && (
        <div className="card-glow max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-6">Add Liquidity</h3>

          {/* Token 0 */}
          <div className="p-4 rounded-xl bg-surface-light border border-border mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Token 1</span>
              <span className="text-sm text-gray-400">
                Balance: {parseFloat(token0?.balance || '0').toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount0}
                onChange={(e) => {
                  setAmount0(e.target.value)
                  if (e.target.value) {
                    setAmount1((parseFloat(e.target.value) * 1.0).toFixed(6))
                  }
                }}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              />
              <TokenSelector
                selectedToken={token0}
                onSelect={setToken0}
                excludeToken={token1}
              />
            </div>
          </div>

          <div className="flex justify-center my-2">
            <Plus className="w-6 h-6 text-gray-500" />
          </div>

          {/* Token 1 */}
          <div className="p-4 rounded-xl bg-surface-light border border-border mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Token 2</span>
              <span className="text-sm text-gray-400">
                Balance: {parseFloat(token1?.balance || '0').toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              />
              <TokenSelector
                selectedToken={token1}
                onSelect={setToken1}
                excludeToken={token0}
              />
            </div>
          </div>

          {/* Pool Info */}
          {amount0 && amount1 && (
            <div className="p-4 rounded-xl bg-surface-light/50 border border-border/50 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pool Share</span>
                <span>0.05%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">LP Tokens</span>
                <span>~{(parseFloat(amount0) * 0.5).toFixed(4)}</span>
              </div>
            </div>
          )}

          <button
            onClick={isConnected ? handleAddLiquidity : connect}
            disabled={isConnected && (!amount0 || !amount1 || isProcessing)}
            className="btn-primary w-full"
          >
            {!isConnected
              ? 'Connect Wallet'
              : isProcessing
              ? 'Adding Liquidity...'
              : !amount0 || !amount1
              ? 'Enter Amounts'
              : 'Add Liquidity'}
          </button>
        </div>
      )}

      {/* Remove Liquidity */}
      {activeTab === 'remove' && (
        <div className="card-glow max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-6">Remove Liquidity</h3>

          {/* Pool Selection */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Select Pool</label>
            <div className="space-y-2">
              {mockPools
                .filter((p) => parseFloat(p.userLiquidity) > 0)
                .map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      selectedPool?.id === pool.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface-light hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold border-2 border-surface">
                            {pool.token0.symbol.charAt(0)}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-xs font-bold border-2 border-surface">
                            {pool.token1.symbol.charAt(0)}
                          </div>
                        </div>
                        <span className="font-medium">
                          {pool.token0.symbol}/{pool.token1.symbol}
                        </span>
                      </div>
                      <span className="font-semibold">${pool.userLiquidity}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {selectedPool && (
            <>
              {/* Amount Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Amount to Remove</span>
                  <span className="text-2xl font-bold text-primary">{removePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={removePercent}
                  onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setRemovePercent(percent)}
                      className="px-3 py-1 text-sm rounded-lg bg-surface-light border border-border hover:border-primary/50 transition-colors"
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Preview */}
              <div className="p-4 rounded-xl bg-surface-light border border-border mb-6">
                <div className="text-sm text-gray-400 mb-3">You will receive</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">
                        {selectedPool.token0.symbol.charAt(0)}
                      </div>
                      <span>{selectedPool.token0.symbol}</span>
                    </div>
                    <span className="font-semibold">
                      {((parseFloat(selectedPool.reserve0) * removePercent) / 100 / 1000).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-xs font-bold">
                        {selectedPool.token1.symbol.charAt(0)}
                      </div>
                      <span>{selectedPool.token1.symbol}</span>
                    </div>
                    <span className="font-semibold">
                      {((parseFloat(selectedPool.reserve1) * removePercent) / 100 / 1000).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={isConnected ? handleRemoveLiquidity : connect}
                disabled={isConnected && (removePercent === 0 || isProcessing)}
                className="btn-primary w-full"
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isProcessing
                  ? 'Removing Liquidity...'
                  : removePercent === 0
                  ? 'Select Amount'
                  : 'Remove Liquidity'}
              </button>
            </>
          )}

          {!selectedPool && mockPools.filter((p) => parseFloat(p.userLiquidity) > 0).length === 0 && (
            <div className="text-center py-8">
              <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">You don't have any liquidity positions</p>
              <button onClick={() => setActiveTab('add')} className="btn-primary">
                Add Liquidity
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          )}
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

export default PoolPage
