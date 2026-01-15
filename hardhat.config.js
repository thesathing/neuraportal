require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    scripts: "./scripts"
  }
  ,
  networks: {
    hardhat: {},
    neuratestnet: {
      url: process.env.RPC_URL || "https://testnet.rpc.neuraprotocol.io/",
      chainId: 267,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
