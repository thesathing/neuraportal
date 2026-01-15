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
  ROUTER: '0x5AeFBA317BAba46EAF98Fd6f381d07673bcA6467',
  FACTORY: '0x29466Fc225c7A5B3c9bD07429C6bCB49ef420579',
  FAUCET: '0x79e261E2f02046045928a5Bc7Ea15f8C9cACFf14',
  FARMING: '0x77dfD6Dd05Da1906FB6114e9f70552Dd84a0A632',
  NEURA: '0x445Ed70F9CFd85e1366eD60F2CaF096289FB25d1',
  wANKR: '0x422F5Eae5fEE0227FB31F149E690a73C4aD02dB8',
}
