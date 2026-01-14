export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: '0x10B',
  name: 'Neura Testnet',
  rpcUrl: 'https://testnet.rpc.neuraprotocol.io/',
  blockExplorer: 'https://testnet-blockscout.infra.neuraprotocol.io/',
  nativeCurrency: {
    name: 'ANKR',
    symbol: 'ANKR',
    decimals: 18,
  },
}

export const TOKENS = {
  ANKR: {
    symbol: 'ANKR',
    name: 'Neura Native Token',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
  },
  ztUSD: {
    symbol: 'ztUSD',
    name: 'ztUSD Stablecoin',
    address: '0x9423c6C914857e6DaAACe3b585f4640231505128',
    decimals: 18,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x3A631ee99eF7fE2D248116982b14e7615ac77502',
    decimals: 18,
  },
  wANKR: {
    symbol: 'wANKR',
    name: 'Wrapped ANKR',
    address: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8',
    decimals: 18,
  },
}

export const CONTRACT_ADDRESSES = {
  ROUTER: '0x0000000000000000000000000000000000000001',
  FACTORY: '0x0000000000000000000000000000000000000002',
  FAUCET: '0x0000000000000000000000000000000000000003',
  FARMING: '0x0000000000000000000000000000000000000004',
}
