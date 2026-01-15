import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SwapPage from './pages/SwapPage'
import PoolPage from './pages/PoolPage'
import TokenDeployPage from './pages/TokenDeployPage'
import FaucetPage from './pages/FaucetPage'
import AccountPage from './pages/AccountPage'
import FarmingPage from './pages/FarmingPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SwapPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/pool" element={<PoolPage />} />
        <Route path="/token" element={<TokenDeployPage />} />
        <Route path="/faucet" element={<FaucetPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/farming" element={<FarmingPage />} />
      </Routes>
    </Layout>
  )
}

export default App
