
const fs = require('fs');
const path = require('path');
const gData = require('geni_data');
const {Interface} = require('ethers');

const networks = gData.getNetworkConfig();
const genidexABIFile = '../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
const geniRewarderABIFile = '../geni_rewarder/artifacts/contracts/GeniRewarder.sol/GeniRewarder.json';

function main(){
    generateNetworks();
    generateGeniDexABI();
    generateRewarderABI();
}
main();

function generateNetworks(){
    const fileData = {};

    for(let networkName in networks){
        const network = networks[networkName];
        if(networkName=='hardhat') continue;
        fileData[networkName] = {
            chainId: network.chainId,
            contracts: {
                "GeniDex": gData.getGeniDexAddress(networkName),
                "GeniToken": gData.getGeniTokenAddress(networkName),
                "GeniRewarder": gData.getGeniRewarder(networkName)
            }
        }
    }

    const filePath = path.join(__dirname, '../src/config/networks.ts')
    const ts = `export const networks = ${JSON.stringify(fileData, null, 2)};`;
    fs.writeFileSync(filePath, ts);

    console.log('\n', filePath);
}

function generateGeniDexABI(){
    const raw = fs.readFileSync(genidexABIFile, 'utf-8');
    const data = JSON.parse(raw);
    const abiJson = data.abi;

    const iface = new Interface(abiJson);
    const fragments = Object.values(iface.fragments).map((f) => f.format('full'));
    const ts = `export const geniDexABI = ${JSON.stringify(fragments, null, 2)};`;
    const filePath = path.join(__dirname, '../src/abis/genidex.abi.ts')
    fs.writeFileSync(filePath, ts);

    const filePath2 = path.join(__dirname, '../src/abis/genidex.full.abi.ts')
    const ts2 = `export const geniDexFullABI = ${JSON.stringify(abiJson, null, 2)};`;
    fs.writeFileSync(filePath2, ts2);

    console.log('\n', filePath);
    console.log(filePath2);
}

function generateRewarderABI(){
    const raw = fs.readFileSync(geniRewarderABIFile, 'utf-8');
    const data = JSON.parse(raw);
    const abiJson = data.abi;

    const iface = new Interface(abiJson);
    const fragments = Object.values(iface.fragments).map((f) => f.format('full'));
    const ts = `export const rewarderABI = ${JSON.stringify(fragments, null, 2)};`;
    const filePath = path.join(__dirname, '../src/abis/rewarder.abi.ts')
    fs.writeFileSync(filePath, ts);

    const ts2 = `export const rewarderFullABI = ${JSON.stringify(abiJson, null, 2)};`;
    const filePath2 = path.join(__dirname, '../src/abis/rewarder.full.abi.ts')
    fs.writeFileSync(filePath2, ts2);
    console.log('\n', filePath);
    console.log(filePath2, '\n');
}

