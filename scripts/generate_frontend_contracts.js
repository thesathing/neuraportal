const fs = require('fs');
const path = require('path');
const solc = require('solc');

function readSolFiles(dir) {
  const files = {};
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      Object.assign(files, readSolFiles(full));
    } else if (it.endsWith('.sol')) {
      const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
      files[rel] = { content: fs.readFileSync(full, 'utf8') };
    }
  }
  return files;
}

function findImports(dependency) {
  try {
    const full = path.resolve(process.cwd(), dependency);
    return { contents: fs.readFileSync(full, 'utf8') };
  } catch (e) {
    return { error: 'File not found' };
  }
}

function compile() {
  const sources = readSolFiles(path.resolve(process.cwd(), 'contracts'));
  const input = {
    language: 'Solidity',
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi'] } }
    }
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const hasError = output.errors.some((e) => e.severity === 'error');
    for (const e of output.errors) console.log(e.formattedMessage || e.message);
    if (hasError) throw new Error('Compilation failed');
  }
  return output.contracts;
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function updateConstants(addresses) {
  const constantsPath = path.resolve(process.cwd(), 'frontend/src/config/constants.ts');
  if (!fs.existsSync(constantsPath)) return;
  let content = fs.readFileSync(constantsPath, 'utf8');
  // replace CONTRACT_ADDRESSES block
  const newBlock = `export const CONTRACT_ADDRESSES = {
  ROUTER: '${addresses.NeuraRouter || '0x0000000000000000000000000000000000000000'}',
  FACTORY: '${addresses.NeuraFactory || '0x0000000000000000000000000000000000000000'}',
  FAUCET: '${addresses.NeuraFaucet || '0x0000000000000000000000000000000000000000'}',
  FARMING: '${addresses.NeuraFarming || '0x0000000000000000000000000000000000000000'}',
}`;
  content = content.replace(/export const CONTRACT_ADDRESSES = \{[\s\S]*?\};?/m, newBlock);
  fs.writeFileSync(constantsPath, content, 'utf8');
  console.log('Updated frontend/src/config/constants.ts with deployed addresses');
}

function writeABIs(contracts) {
  const outDir = path.resolve(process.cwd(), 'frontend/src/contracts');
  ensureDir(outDir);
  for (const file of Object.keys(contracts)) {
    for (const name of Object.keys(contracts[file])) {
      const abi = contracts[file][name].abi;
      if (!abi) continue;
      const outPath = path.join(outDir, `${name}.json`);
      fs.writeFileSync(outPath, JSON.stringify(abi, null, 2), 'utf8');
      console.log('Wrote', outPath);
    }
  }
}

function main() {
  const deployedPath = path.resolve(process.cwd(), 'deployed_ethers.json');
  const deployed = fs.existsSync(deployedPath) ? JSON.parse(fs.readFileSync(deployedPath, 'utf8')) : {};
  console.log('Compiling contracts to extract ABIs...');
  const contracts = compile();
  writeABIs(contracts);
  updateConstants(deployed);
  console.log('Done — frontend updated with ABIs and addresses');
}

main();
