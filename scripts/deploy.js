const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("NeuraFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("NeuraFactory:", factory.address);

  const Token = await hre.ethers.getContractFactory("NeuraToken");
  const wankr = await Token.deploy("WANKR", "WANKR", 18, hre.ethers.utils.parseUnits("1000000", 18), false, false, false);
  await wankr.deployed();
  console.log("WANKR (NeuraToken):", wankr.address);

  const Router = await hre.ethers.getContractFactory("NeuraRouter");
  const router = await Router.deploy(factory.address, wankr.address);
  await router.deployed();
  console.log("NeuraRouter:", router.address);

  const Faucet = await hre.ethers.getContractFactory("NeuraFaucet");
  const faucet = await Faucet.deploy();
  await faucet.deployed();
  console.log("NeuraFaucet:", faucet.address);

  const Farming = await hre.ethers.getContractFactory("NeuraFarming");
  const farming = await Farming.deploy();
  await farming.deployed();
  console.log("NeuraFarming:", farming.address);

  const neur = await Token.deploy("Neura", "NEUR", 18, hre.ethers.utils.parseUnits("1000000", 18), true, true, false);
  await neur.deployed();
  console.log("Neura token:", neur.address);

  const fs = require("fs");
  const out = {
    NeuraFactory: factory.address,
    WANKR: wankr.address,
    NeuraRouter: router.address,
    NeuraFaucet: faucet.address,
    NeuraFarming: farming.address,
    NeuraToken: neur.address
  };
  fs.writeFileSync("deployed.json", JSON.stringify(out, null, 2));
  console.log('Wrote deployed addresses to deployed.json');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
