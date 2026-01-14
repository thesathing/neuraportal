import { useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { useStore } from '../store/useStore'
import { NEURA_TESTNET } from '../config/constants'

declare global {
  interface Window {
    ethereum?: any
  }
}

export const useWallet = () => {
  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    setAddress,
    setChainId,
    setIsConnected,
    setIsConnecting,
    tokens,
    updateTokenBalance,
  } = useStore()

  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum)
    }
    return null
  }, [])

  const switchToNeura = useCallback(async () => {
    if (!window.ethereum) return false
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainIdHex }],
      })
      return true
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NEURA_TESTNET.chainIdHex,
              chainName: NEURA_TESTNET.name,
              nativeCurrency: NEURA_TESTNET.nativeCurrency,
              rpcUrls: [NEURA_TESTNET.rpcUrl],
              blockExplorerUrls: [NEURA_TESTNET.blockExplorer],
            }],
          })
          return true
        } catch (addError) {
          console.error('Failed to add network:', addError)
          return false
        }
      }
      console.error('Failed to switch network:', switchError)
      return false
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet!')
      return
    }

    setIsConnecting(true)
    
    try {
      const provider = getProvider()
      if (!provider) throw new Error('No provider')

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))

        if (Number(network.chainId) !== NEURA_TESTNET.chainId) {
          await switchToNeura()
        }
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [getProvider, setAddress, setChainId, setIsConnected, setIsConnecting, switchToNeura])

  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    setIsConnected(false)
  }, [setAddress, setChainId, setIsConnected])

  const fetchBalances = useCallback(async () => {
    if (!address || !isConnected) return

    const provider = getProvider()
    if (!provider) return

    try {
      // Fetch native balance
      const nativeBalance = await provider.getBalance(address)
      updateTokenBalance('0x0000000000000000000000000000000000000000', ethers.formatEther(nativeBalance))

      // Fetch ERC20 balances
      const erc20Abi = ['function balanceOf(address) view returns (uint256)']
      
      for (const token of tokens) {
        if (token.address === '0x0000000000000000000000000000000000000000') continue
        
        try {
          const contract = new ethers.Contract(token.address, erc20Abi, provider)
          const balance = await contract.balanceOf(address)
          updateTokenBalance(token.address, ethers.formatUnits(balance, token.decimals))
        } catch (e) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, e)
        }
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    }
  }, [address, isConnected, getProvider, tokens, updateTokenBalance])

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
        } else {
          disconnect()
        }
      })

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [setAddress, setChainId, disconnect])

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances()
    }
  }, [isConnected, address, fetchBalances])

  return {
    address,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchToNeura,
    fetchBalances,
    getProvider,
    isCorrectNetwork: chainId === NEURA_TESTNET.chainId,
  }
}
