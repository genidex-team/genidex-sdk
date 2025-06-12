
const fs = require('fs');
const path = require('path');
const gData = require('geni_data');

const networks = gData.getNetworkConfig();

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

const filePath = path.join(__dirname, '../src/config/networks.json')
fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
console.log(fileData);