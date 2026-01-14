import { create } from 'zustand'

interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  balance: string
  logo?: string
}

interface Pool {
  id: string
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  totalSupply: string
  userLiquidity: string
  apr: number
}

interface Farm {
  id: string
  pool: Pool
  rewardToken: Token
  totalStaked: string
  userStaked: string
  pendingRewards: string
  apr: number
  endTime: number
}

interface Transaction {
  hash: string
  type: 'swap' | 'addLiquidity' | 'removeLiquidity' | 'stake' | 'unstake' | 'claim' | 'deploy' | 'faucet'
  status: 'pending' | 'success' | 'failed'
  timestamp: number
  details: string
}

interface AppState {
  // Wallet
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  
  // Tokens
  tokens: Token[]
  
  // Pools
  pools: Pool[]
  
  // Farms
  farms: Farm[]
  
  // Transactions
  transactions: Transaction[]
  
  // Actions
  setAddress: (address: string | null) => void
  setChainId: (chainId: number | null) => void
  setIsConnected: (isConnected: boolean) => void
  setIsConnecting: (isConnecting: boolean) => void
  setTokens: (tokens: Token[]) => void
  updateTokenBalance: (address: string, balance: string) => void
  setPools: (pools: Pool[]) => void
  setFarms: (farms: Farm[]) => void
  addTransaction: (tx: Transaction) => void
  updateTransaction: (hash: string, status: Transaction['status']) => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  
  tokens: [
    {
      symbol: 'ANKR',
      name: 'Neura Native Token',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      balance: '0',
    },
    {
      symbol: 'ztUSD',
      name: 'ztUSD Stablecoin',
      address: '0x9423c6C914857e6DaAACe3b585f4640231505128',
      decimals: 18,
      balance: '0',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x3A631ee99eF7fE2D248116982b14e7615ac77502',
      decimals: 18,
      balance: '0',
    },
    {
      symbol: 'wANKR',
      name: 'Wrapped ANKR',
      address: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8',
      decimals: 18,
      balance: '0',
    },
  ],
  
  pools: [],
  farms: [],
  transactions: [],
  
  // Actions
  setAddress: (address) => set({ address }),
  setChainId: (chainId) => set({ chainId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setTokens: (tokens) => set({ tokens }),
  updateTokenBalance: (address, balance) => set((state) => ({
    tokens: state.tokens.map((t) =>
      t.address.toLowerCase() === address.toLowerCase() ? { ...t, balance } : t
    ),
  })),
  setPools: (pools) => set({ pools }),
  setFarms: (farms) => set({ farms }),
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions].slice(0, 50),
  })),
  updateTransaction: (hash, status) => set((state) => ({
    transactions: state.transactions.map((tx) =>
      tx.hash === hash ? { ...tx, status } : tx
    ),
  })),
}))
