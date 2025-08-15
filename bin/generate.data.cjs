
const fs = require('fs');
const path = require('path');
const gData = require('geni_data');
const {Interface} = require('ethers');

const networks = gData.getNetworkConfig();
// const genidexABIFile = '../genidex_contract/artifacts/contracts/GeniDex.sol/GeniDex.json';
const genidexABIFile = '../genidex_contract/data/abis/genidex.full.abi.json';
const genidexReaderABIFile = '../genidex_contract/artifacts/contracts/GeniDexReader.sol/GeniDexReader.json';
const geniRewarderABIFile = '../geni_rewarder/artifacts/contracts/GeniRewarder.sol/GeniRewarder.json';
const accessManagerABIFile = '../genidex_contract/artifacts/contracts/GeniAccessManager.sol/GeniAccessManager.json';

function main(){
    generateNetworks();
    generateGeniDexABI();
    generateRewarderABI();
    generateAccessManagerABI();
}
main();

function generateGeniDexABI(){
    const raw = fs.readFileSync(genidexABIFile, 'utf-8');
    const abi = JSON.parse(raw);

    /*const raw2 = fs.readFileSync(genidexReaderABIFile, 'utf-8');
    const data2 = JSON.parse(raw2);
    // const abiJson2 = data2.abi;

    const mergedAbi = [
        ...data.abi,
        ...data2.abi,
    ];*/

    const iface = new Interface(abi);
    const fragments = Object.values(iface.fragments).map((f) => f.format('full'));
    const ts = `export const geniDexABI = ${JSON.stringify(fragments, null, 2)};`;
    const filePath = path.join(__dirname, '../src/abis/genidex.abi.ts')
    fs.writeFileSync(filePath, ts);

    const filePath2 = path.join(__dirname, '../src/abis/genidex.full.abi.ts')
    const ts2 = `export const geniDexFullABI = ${JSON.stringify(abi, null, 2)};`;
    fs.writeFileSync(filePath2, ts2);

    console.log('\n', filePath);
    console.log(filePath2);
}

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
                "GeniRewarder": gData.getGeniRewarder(networkName),
                "AccessManager": gData.getAccessManagerAddress(networkName)
            }
        }
    }

    const filePath = path.join(__dirname, '../src/config/networks.ts')
    const ts = `export const networks = ${JSON.stringify(fileData, null, 2)};`;
    fs.writeFileSync(filePath, ts);

    console.log('\n', filePath);
}

function generateGeniDexABI____(){
    const raw = fs.readFileSync(genidexABIFile, 'utf-8');
    const data = JSON.parse(raw);
    // const abiJson = data.abi;

    const raw2 = fs.readFileSync(genidexReaderABIFile, 'utf-8');
    const data2 = JSON.parse(raw2);
    // const abiJson2 = data2.abi;

    const mergedAbi = [
        ...data.abi,
        ...data2.abi,
    ];

    const iface = new Interface(mergedAbi);
    const fragments = Object.values(iface.fragments).map((f) => f.format('full'));
    const ts = `export const geniDexABI = ${JSON.stringify(fragments, null, 2)};`;
    const filePath = path.join(__dirname, '../src/abis/genidex.abi.ts')
    fs.writeFileSync(filePath, ts);

    const filePath2 = path.join(__dirname, '../src/abis/genidex.full.abi.ts')
    const ts2 = `export const geniDexFullABI = ${JSON.stringify(mergedAbi, null, 2)};`;
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

function generateAccessManagerABI(){
    const raw = fs.readFileSync(accessManagerABIFile, 'utf-8');
    const data = JSON.parse(raw);
    const abiJson = data.abi;

    const iface = new Interface(abiJson);
    const fragments = Object.values(iface.fragments).map((f) => f.format('full'));
    const ts = `export const accessManagerABI = ${JSON.stringify(fragments, null, 2)};`;
    const filePath = path.join(__dirname, '../src/abis/access.manager.abi.ts')
    fs.writeFileSync(filePath, ts);

    const ts2 = `export const accessManagerFullABI = ${JSON.stringify(abiJson, null, 2)};`;
    const filePath2 = path.join(__dirname, '../src/abis/access.manager.full.abi.ts')
    fs.writeFileSync(filePath2, ts2);
    console.log('\n', filePath);
    console.log(filePath2, '\n');
}

