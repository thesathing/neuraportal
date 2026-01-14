import React, { useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  balance: string
}

interface TokenSelectorProps {
  selectedToken: Token | null
  onSelect: (token: Token) => void
  excludeToken?: Token | null
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, onSelect, excludeToken }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { tokens } = useStore()

  const filteredTokens = tokens.filter((token) => {
    if (excludeToken && token.address.toLowerCase() === excludeToken.address.toLowerCase()) {
      return false
    }
    if (search) {
      return (
        token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        token.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    return true
  })

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0'
    if (num < 0.0001) return '<0.0001'
    return num.toFixed(4)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-light border border-border hover:border-primary/50 transition-all min-w-[140px]"
      >
        {selectedToken ? (
          <>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">
              {selectedToken.symbol.charAt(0)}
            </div>
            <span className="font-medium">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-gray-400">Select token</span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Select Token</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or address"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onSelect(token)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-light transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{formatBalance(token.balance)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default TokenSelector
