const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const EXPLORER_API = process.env.EXPLORER_API_URL || 'https://testnet-blockscout.infra.neuraprotocol.io';
const API_ENDPOINT = EXPLORER_API.replace(/\/$/, '') + '/api';
const API_KEY = process.env.EXPLORER_API_KEY || '';

function readSources() {
  const base = path.resolve(process.cwd(), 'contracts');
  const files = {};
  function walk(dir) {
    for (const it of fs.readdirSync(dir)) {
      const full = path.join(dir, it);
      const s = fs.statSync(full);
      if (s.isDirectory()) walk(full);
      else if (it.endsWith('.sol')) {
        const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
        files[rel] = fs.readFileSync(full, 'utf8');
      }
    }
  }
  walk(base);
  return files;
}

async function verify(contractName, contractAddress, sourceFile) {
  const sourceCode = fs.readFileSync(sourceFile, 'utf8');
  const contractPath = path.relative(process.cwd(), sourceFile).replace(/\\/g, '/');
  const payload = new URLSearchParams();
  payload.append('module', 'contract');
  payload.append('action', 'verifysourcecode');
  payload.append('contractaddress', contractAddress);
  payload.append('sourceCode', sourceCode);
  payload.append('codeformat', 'solidity-single-file');
  payload.append('contractname', `${contractPath}:${contractName}`);
  payload.append('compilerversion', 'v0.8.20+commit.a1b79de6');
  if (API_KEY) payload.append('apikey', API_KEY);

  try {
    const res = await axios.post(API_ENDPOINT, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const deployedPath = path.resolve(process.cwd(), 'deployed_ethers.json');
  if (!fs.existsSync(deployedPath)) {
    console.error('deployed_ethers.json not found');
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));
  const sources = readSources();

  const results = {};
  for (const name of Object.keys(deployed)) {
    const address = deployed[name];
    // try to find source file that contains the contract name
    const file = Object.keys(sources).find((k) => sources[k].includes(`contract ${name}`) || sources[k].includes(`interface ${name}`));
    if (!file) {
      results[name] = { ok: false, error: 'source file not found' };
      continue;
    }
    console.log(`Verifying ${name} at ${address} using ${file}...`);
    const r = await verify(name, address, path.resolve(process.cwd(), file));
    results[name] = r;
    console.log(`Result for ${name}:`, r);
    // be polite to explorer
    await new Promise((r2) => setTimeout(r2, 1500));
  }
  fs.writeFileSync('verification_results.json', JSON.stringify(results, null, 2));
  console.log('Wrote verification_results.json');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
