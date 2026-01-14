import React, { useState, useEffect } from 'react'
import { ArrowDownUp, Settings, Info, Zap, TrendingUp, Clock } from 'lucide-react'
import TokenSelector from '../components/TokenSelector'
import TransactionModal from '../components/TransactionModal'
import { useStore } from '../store/useStore'
import { useWallet } from '../hooks/useWallet'

const SwapPage: React.FC = () => {
  const { tokens, addTransaction } = useStore()
  const { isConnected, connect, address } = useWallet()
  
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [showSettings, setShowSettings] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
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

  // Mock exchange rate calculation
  const exchangeRate = 1.05
  
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const calculated = (parseFloat(fromAmount) * exchangeRate).toFixed(6)
      setToAmount(calculated)
    } else {
      setToAmount('')
    }
  }, [fromAmount, fromToken, toToken])

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
  }

  const handleSwap = async () => {
    if (!isConnected || !fromAmount || parseFloat(fromAmount) <= 0) return

    setIsSwapping(true)
    setTxModal({
      isOpen: true,
      status: 'pending',
      title: 'Swapping Tokens',
      message: `Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}...`,
    })

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    
    addTransaction({
      hash: mockTxHash,
      type: 'swap',
      status: 'success',
      timestamp: Date.now(),
      details: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
    })

    setTxModal({
      isOpen: true,
      status: 'success',
      title: 'Swap Successful',
      message: `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      txHash: mockTxHash,
    })

    setIsSwapping(false)
    setFromAmount('')
    setToAmount('')
  }

  const priceImpact = 0.12
  const minimumReceived = toAmount ? (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6) : '0'

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
          Swap Tokens
        </h1>
        <p className="text-gray-400">Trade tokens instantly on Neura Testnet</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-glow text-center">
          <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Gas</div>
          <div className="font-semibold">~0.001 ANKR</div>
        </div>
        <div className="card-glow text-center">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-2" />
          <div className="text-sm text-gray-400">Rate</div>
          <div className="font-semibold">1:{exchangeRate}</div>
        </div>
        <div className="card-glow text-center">
          <Clock className="w-5 h-5 text-secondary mx-auto mb-2" />
          <div className="text-sm text-gray-400">Time</div>
          <div className="font-semibold">~3 sec</div>
        </div>
      </div>

      {/* Swap Card */}
      <div className="card-glow relative">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-light transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-xl bg-surface-light border border-border">
            <div className="text-sm font-medium mb-3">Slippage Tolerance</div>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    slippage === value
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border hover:border-primary/50'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 px-3 py-2 rounded-lg bg-surface border border-border text-center text-sm"
                placeholder="Custom"
              />
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="p-4 rounded-xl bg-surface-light border border-border mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-400">
              Balance: {parseFloat(fromToken?.balance || '0').toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <TokenSelector
              selectedToken={fromToken}
              onSelect={setFromToken}
              excludeToken={toToken}
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => {
                  const balance = parseFloat(fromToken?.balance || '0')
                  setFromAmount(((balance * percent) / 100).toString())
                }}
                className="px-2 py-1 text-xs rounded bg-surface border border-border hover:border-primary/50 transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-3 rounded-xl bg-surface border border-border hover:border-primary hover:bg-surface-light transition-all group"
          >
            <ArrowDownUp className="w-5 h-5 group-hover:text-primary transition-colors" />
          </button>
        </div>

        {/* To Token */}
        <div className="p-4 rounded-xl bg-surface-light border border-border mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-400">
              Balance: {parseFloat(toToken?.balance || '0').toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <TokenSelector
              selectedToken={toToken}
              onSelect={setToToken}
              excludeToken={fromToken}
            />
          </div>
        </div>

        {/* Swap Details */}
        {fromAmount && toAmount && (
          <div className="mt-4 p-4 rounded-xl bg-surface-light/50 border border-border/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Rate
              </span>
              <span>
                1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={priceImpact > 1 ? 'text-warning' : 'text-success'}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum Received</span>
              <span>
                {minimumReceived} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slippage</span>
              <span>{slippage}%</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={isConnected ? handleSwap : connect}
          disabled={isConnected && (!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping)}
          className="btn-primary w-full mt-6"
        >
          {!isConnected
            ? 'Connect Wallet'
            : isSwapping
            ? 'Swapping...'
            : !fromAmount || parseFloat(fromAmount) <= 0
            ? 'Enter Amount'
            : 'Swap'}
        </button>
      </div>

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

export default SwapPage
