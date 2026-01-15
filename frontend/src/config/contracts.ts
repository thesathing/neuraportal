import NeuraFactory from '../contracts/NeuraFactory.json';
import NeuraRouter from '../contracts/NeuraRouter.json';
import NeuraFaucet from '../contracts/NeuraFaucet.json';
import NeuraFarming from '../contracts/NeuraFarming.json';
import NeuraToken from '../contracts/NeuraToken.json';
import IWANKR from '../contracts/IWANKR.json';
import IERC20 from '../contracts/IERC20.json';
import { CONTRACT_ADDRESSES } from './constants';

export const CONTRACTS = {
  Factory: { abi: NeuraFactory, address: CONTRACT_ADDRESSES.FACTORY },
  Router: { abi: NeuraRouter, address: CONTRACT_ADDRESSES.ROUTER },
  Faucet: { abi: NeuraFaucet, address: CONTRACT_ADDRESSES.FAUCET },
  Farming: { abi: NeuraFarming, address: CONTRACT_ADDRESSES.FARMING },
  NeuraToken: { abi: NeuraToken, address: CONTRACT_ADDRESSES.NEURA || CONTRACT_ADDRESSES.NEURATOKEN },
  wANKR: { abi: IWANKR, address: CONTRACT_ADDRESSES.wANKR },
  IERC20: { abi: IERC20 },
};

export default CONTRACTS;
