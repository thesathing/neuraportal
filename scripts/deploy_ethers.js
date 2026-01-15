const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();
const ethers = require('ethers');

const CONTRACTS_DIR = path.resolve(process.cwd(), 'contracts');

function readSolFiles(dir) {
  const files = {};
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      Object.assign(files, readSolFiles(full));
    } else if (it.endsWith(".sol")) {
      const rel = path.relative(process.cwd(), full).replace(/\\/g, "/");
      files[rel] = { content: fs.readFileSync(full, "utf8") };
    }
  }
  return files;
}

function findImports(dependency) {
  try {
    const full = path.resolve(process.cwd(), dependency);
    return { contents: fs.readFileSync(full, "utf8") };
  } catch (e) {
    return { error: "File not found" };
  }
}

async function compileAll() {
  const sources = readSolFiles(CONTRACTS_DIR);
  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"]
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const hasError = output.errors.some((e) => e.severity === "error");
    for (const e of output.errors) console.log(e.formattedMessage || e.message);
    if (hasError) throw new Error("Compilation failed");
  }
  return output.contracts;
}

async function main() {
  const pk = process.env.PRIVATE_KEY;
  const rpc = process.env.RPC_URL;
  if (!pk || !rpc) {
    console.error("Missing PRIVATE_KEY or RPC_URL in .env");
    process.exit(1);
  }

  console.log("Compiling contracts (solc)...");
  const contracts = await compileAll();

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  console.log("Deploying with:", wallet.address);

  const artifacts = {};
  for (const file of Object.keys(contracts)) {
    for (const name of Object.keys(contracts[file])) {
      artifacts[name] = contracts[file][name];
    }
  }

  async function deploy(name, args = []) {
    const art = artifacts[name];
    if (!art) throw new Error(`Artifact ${name} not found`);
    const factory = new ethers.ContractFactory(art.abi, art.evm.bytecode.object, wallet);
    const ctr = await factory.deploy(...args);
    if (typeof ctr.waitForDeployment === 'function') {
      await ctr.waitForDeployment();
    } else if (typeof ctr.deployed === 'function') {
      await ctr.deployed();
    }
    let address;
    if (ctr.address) address = ctr.address;
    else if (ctr.target) address = ctr.target;
    else if (typeof ctr.getAddress === 'function') address = await ctr.getAddress();
    else {
      const tx = ctr.deployTransaction || ctr.deployTx;
      if (tx && tx.hash) {
        const receipt = await wallet.provider.getTransactionReceipt(tx.hash);
        address = receipt.contractAddress;
      }
    }
    console.log(`${name} -> ${address}`);
    return address;
  }

  const deployed = {};

  const parseUnits = ethers.parseUnits || (ethers.utils && ethers.utils.parseUnits);
  deployed.NeuraFactory = await deploy("NeuraFactory", [wallet.address]);
  deployed.WANKR = await deploy("NeuraToken", ["WANKR", "WANKR", 18, parseUnits("1000000", 18), false, false, false]);
  deployed.NeuraRouter = await deploy("NeuraRouter", [deployed.NeuraFactory, deployed.WANKR]);
  deployed.NeuraFaucet = await deploy("NeuraFaucet");
  deployed.NeuraFarming = await deploy("NeuraFarming");
  deployed.NeuraToken = await deploy("NeuraToken", ["Neura", "NEUR", 18, parseUnits("1000000", 18), true, true, false]);

  fs.writeFileSync("deployed_ethers.json", JSON.stringify(deployed, null, 2));
  console.log("Wrote deployed_ethers.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
