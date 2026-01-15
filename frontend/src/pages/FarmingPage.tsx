import React, { useState } from 'react'
import { 
  Sprout, 
  TrendingUp, 
  Clock, 
  Coins, 
  Plus, 
  Minus,
  Gift,
  Zap,
  Lock,
  Unlock
} from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'

interface Farm {
  id: string
  name: string
  token0: string
  token1: string
  rewardToken: string
  apr: number
  totalStaked: string
  userStaked: string
  pendingRewards: string
  multiplier: string
  endTime: number
  isActive: boolean
}

const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'ANKR-ztUSD',
    token0: 'ANKR',
    token1: 'ztUSD',
    rewardToken: 'ANKR',
    apr: 125.5,
    totalStaked: '2500000',
    userStaked: '5000',
    pendingRewards: '125.5',
    multiplier: '40x',
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    isActive: true,
  },
  {
    id: '2',
    name: 'ztUSD-USDT',
    token0: 'ztUSD',
    token1: 'USDT',
    rewardToken: 'ANKR',
    apr: 45.2,
    totalStaked: '5000000',
    userStaked: '0',
    pendingRewards: '0',
    multiplier: '10x',
    endTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
    isActive: true,
  },
  {
    id: '3',
    name: 'wANKR-ANKR',
    token0: 'wANKR',
    token1: 'ANKR',
    rewardToken: 'ANKR',
    apr: 85.7,
    totalStaked: '1500000',
    userStaked: '2500',
    pendingRewards: '45.2',
    multiplier: '25x',
    endTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
    isActive: true,
  },
]

const FarmingPage: React.FC = () => {
  const { addTransaction } = useStore()
  const { isConnected, connect } = useWallet()
  
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [actionType, setActionType] = useState<'stake' | 'unstake' | null>(null)
  const [amount, setAmount] = useState('')
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

  const handleStake = async () => {
    if (!isConnected || !selectedFarm || !amount) return

    setIsProcessing(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: actionType === 'stake' ? 'Staking LP Tokens' : 'Unstaking LP Tokens',
      message: `${actionType === 'stake' ? 'Staking' : 'Unstaking'} ${amount} ${selectedFarm.name} LP tokens...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: actionType === 'stake' ? 'stake' : 'unstake',
      status: 'success',
      timestamp: Date.now(),
      details: `${actionType === 'stake' ? 'Staked' : 'Unstaked'} ${amount} ${selectedFarm.name} LP`,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: actionType === 'stake' ? 'Staked Successfully!' : 'Unstaked Successfully!',
      message: `Successfully ${actionType === 'stake' ? 'staked' : 'unstaked'} ${amount} ${selectedFarm.name} LP tokens`,
      txHash: mockTxHash,
    })

    setIsProcessing(false)
    setAmount('')
    setSelectedFarm(null)
    setActionType(null)
  }

  const handleHarvest = async (farm: Farm) => {
    if (!isConnected || parseFloat(farm.pendingRewards) <= 0) return

    setIsProcessing(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Harvesting Rewards',
      message: `Harvesting ${farm.pendingRewards} ${farm.rewardToken} rewards...`,
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'claim',
      status: 'success',
      timestamp: Date.now(),
      details: `Harvested ${farm.pendingRewards} ${farm.rewardToken} from ${farm.name}`,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Rewards Harvested!',
      message: `Successfully harvested ${farm.pendingRewards} ${farm.rewardToken}`,
      txHash: mockTxHash,
    })

    setIsProcessing(false)
  }

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    return `${days} days`
  }

  const totalUserStaked = mockFarms.reduce((acc, farm) => acc + parseFloat(farm.userStaked), 0)
  const totalPendingRewards = mockFarms.reduce((acc, farm) => acc + parseFloat(farm.pendingRewards), 0)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          Yield Farming
        </h1>
        <p className="text-gray-400">Stake LP tokens to earn ANKR rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glow text-center">
          <Sprout className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Active Farms</div>
          <div className="text-xl font-bold">{mockFarms.filter(f => f.isActive).length}</div>
        </div>
        <div className="card-glow text-center">
          <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
          <div className="text-sm text-gray-400">Highest APR</div>
          <div className="text-xl font-bold text-success">
            {Math.max(...mockFarms.map(f => f.apr))}%
          </div>
        </div>
        <div className="card-glow text-center">
          <Lock className="w-6 h-6 text-secondary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Your Staked</div>
          <div className="text-xl font-bold">${totalUserStaked.toLocaleString()}</div>
        </div>
        <div className="card-glow text-center">
          <Gift className="w-6 h-6 text-accent mx-auto mb-2" />
          <div className="text-sm text-gray-400">Pending Rewards</div>
          <div className="text-xl font-bold">{totalPendingRewards.toFixed(2)} ANKR</div>
        </div>
      </div>

      {/* Harvest All Button */}
      {isConnected && totalPendingRewards > 0 && (
        <div className="mb-6">
          <button
            onClick={async () => {
              for (const farm of mockFarms) {
                if (parseFloat(farm.pendingRewards) > 0) {
                  await handleHarvest(farm)
                }
              }
            }}
            className="btn-primary w-full md:w-auto"
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Harvest All ({totalPendingRewards.toFixed(2)} ANKR)
          </button>
        </div>
      )}

      {/* Farms List */}
      <div className="space-y-4">
        {mockFarms.map((farm) => (
          <div key={farm.id} className="card-glow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Farm Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold border-2 border-surface z-10">
                      {farm.token0.charAt(0)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold border-2 border-surface">
                      {farm.token1.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-primary text-xs font-bold">
                    {farm.multiplier}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-lg">{farm.name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Coins className="w-3 h-3" />
                    Earn {farm.rewardToken}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-400">APR</div>
                  <div className="font-bold text-success text-lg">{farm.apr}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Total Staked</div>
                  <div className="font-semibold">${parseFloat(farm.totalStaked).toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Your Stake</div>
                  <div className="font-semibold">
                    {parseFloat(farm.userStaked) > 0 ? `$${parseFloat(farm.userStaked).toLocaleString()}` : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Ends In</div>
                  <div className="font-semibold flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(farm.endTime)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {parseFloat(farm.pendingRewards) > 0 && (
                  <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center mb-2">
                    <div className="text-xs text-gray-400">Pending Rewards</div>
                    <div className="font-bold text-success">{farm.pendingRewards} {farm.rewardToken}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!isConnected) {
                        connect()
                      } else {
                        setSelectedFarm(farm)
                        setActionType('stake')
                      }
                    }}
                    className="btn-primary py-2 px-4 text-sm flex-1"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Stake
                  </button>
                  {parseFloat(farm.userStaked) > 0 && (
                    <button
                      onClick={() => {
                        setSelectedFarm(farm)
                        setActionType('unstake')
                      }}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      <Minus className="w-4 h-4 inline mr-1" />
                      Unstake
                    </button>
                  )}
                  {parseFloat(farm.pendingRewards) > 0 && (
                    <button
                      onClick={() => handleHarvest(farm)}
                      disabled={isProcessing}
                      className="btn-secondary py-2 px-4 text-sm text-success border-success/50 hover:bg-success/10"
                    >
                      <Gift className="w-4 h-4 inline mr-1" />
                      Harvest
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stake/Unstake Modal */}
      {selectedFarm && actionType && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => {
            setSelectedFarm(null)
            setActionType(null)
          }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'stake' ? 'bg-primary/20' : 'bg-warning/20'
                }`}>
                  {actionType === 'stake' ? (
                    <Lock className="w-5 h-5 text-primary" />
                  ) : (
                    <Unlock className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {actionType === 'stake' ? 'Stake' : 'Unstake'} LP Tokens
                  </h3>
                  <p className="text-sm text-gray-400">{selectedFarm.name}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-light border border-border mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="text-sm text-gray-400">
                    Available: {actionType === 'stake' ? '1,000' : selectedFarm.userStaked} LP
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-semibold outline-none"
                  />
                  <button
                    onClick={() => setAmount(actionType === 'stake' ? '1000' : selectedFarm.userStaked)}
                    className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedFarm(null)
                    setActionType(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStake}
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  className="btn-primary flex-1"
                >
                  {isProcessing ? 'Processing...' : actionType === 'stake' ? 'Stake' : 'Unstake'}
                </button>
              </div>
            </div>
          </div>
        </>
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

export default FarmingPage
