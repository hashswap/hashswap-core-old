
///////////////////////////////////////////////////////////////////
//First Step in Hashswap Backend Demo 
//TO DEPLOY ALL CONTRACTS OF HASHSWAP AND LINK THEM WITH EACH OTHER
//Deploy Oracle
//Deploy Register
//Call "SetRegisterOracle" from Register
//Deploy HUSD
//Deploy HEX
//Call "SetHEXAddressState" frok HEX
//Deploy Launcher
//Call "SetLauncherAddressState" from Launcher
///////////////////////////////////////////////////////////////////

const fs = require('fs');
const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { setup, deploy_from_file, sc_call } = require("./blockchain.js");
// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid

var CONTRACTS = {};
var contractFolder = '../Scilla';

async function testBlockchain() {
  let tx = sc = null;
  try {
    // Get Balance
    const balance = await setup.zilliqa.blockchain.getBalance(setup.addresses[0]);
    // Get Minimum Gas Price from blockchain
    const minGasPrice = await setup.zilliqa.blockchain.getMinimumGasPrice();

    // Account balance (See note 1)
    console.log(`Your account balance is:`);
    console.log(balance.result);
    console.log(`Current Minimum Gas Price: ${minGasPrice.result}`);
    

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 1. Deploy Oracle
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    contractName = 'Oracle';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';
    
    init = [ 
      { vname: '_scilla_version', type: 'Uint32', value: '0'},
      { vname: 'owner', type: 'ByStr20', value: setup.addresses[0]},
    ];

    gas = {
      "gas_limit": Long.fromNumber(20000), "attempts": 33, "timeout": 1000,
    };

    [tx, sc] = await deploy_from_file(contractFilePath, init, gas);
    console.log(contractName,"contract deployed @ ", sc.address);

    CONTRACTS[contractName] = sc.address;  

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 2. Deploy Register
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    contractName = 'Register';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';

    hardcode = {};
    hardcode["0x13cb20d962e40a1bea7e02cbc6d95e605501a583"] = CONTRACTS["Oracle"];

    init = [ 
      { vname: '_scilla_version', type: 'Uint32', value: '0'},
      { vname: 'owner', type: 'ByStr20', value: setup.addresses[0]},
    ];

    gas = { "gas_limit": Long.fromNumber(20000), "attempts": 33, "timeout": 1000, };

    [tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    console.log(contractName,"contract deployed @ ", sc.address);

    CONTRACTS[contractName] = sc.address;  

    ////////////////////////////////////////////////////////////
    // 2a. Call "SetRegisterOracle" 
    ////////////////////////////////////////////////////////////
    
    gas = { "gas_limit": Long.fromNumber(8000), "attempts": 33, "timeout": 1000, };

    args = [];

    tx = await sc_call(sc, "SetRegisterOracle", args, gas);
    //console.log(`TRANSITION LOG: \n`, tx.receipt.event_logs[0]);

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 3. Deploy HUSD
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    contractName = 'HUSD';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';

    var name = 'HUSD';
    var symbol = 'HUSD';
    var decimals = '18';
    var init_supply = '1000000000000000000';

    init = [ 
      { vname: '_scilla_version', type: 'Uint32', value: '0'},
      { vname: 'contract_owner', type: 'ByStr20', value: setup.addresses[0]},
      { vname: 'name', type: 'String', value: name},
      { vname: 'symbol', type: 'String', value: symbol},
      { vname: 'decimals', type: 'Uint32', value: decimals},
      { vname: 'init_supply', type: 'Uint128', value: init_supply},
    ];

    gas = { "gas_limit": Long.fromNumber(20000), "attempts": 33, "timeout": 1000, };

    [tx, sc] = await deploy_from_file(contractFilePath, init, gas);
    console.log( contractName,"contract deployed @ ", sc.address);

    CONTRACTS[contractName] = sc.address;  

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 4. Deploy HEX
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    contractName = 'HEX';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';

    hardcode = {};
    hardcode["0x5bd6972f41507b163e970577ed48f2b43eb9958f"] = CONTRACTS["HUSD"];

    var initial_fee = '30';
    var inflation_rate = '10';
    init = [ 
      { vname: '_scilla_version', type: 'Uint32', value: '0'},
      { vname: 'initial_owner', type: 'ByStr20', value: setup.addresses[0]},
      { vname: 'initial_fee', type: 'Uint256', value: initial_fee},
      { vname: 'inflation_rate', type: 'Uint256', value: inflation_rate},
    ];

    gas = { "gas_limit": Long.fromNumber(60000), "attempts": 33, "timeout": 1000, };

    [tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    console.log( contractName,"contract deployed @ ", sc.address);

    CONTRACTS[contractName] = sc.address;  

    ////////////////////////////////////////////////////////////
    // 4a. Call "SetHEXAddressState" 
    ////////////////////////////////////////////////////////////
    
    gas = { "gas_limit": Long.fromNumber(8000), "attempts": 33, "timeout": 1000, };

    args = [];

    tx = await sc_call(sc, "SetHEXAddressState", args, gas);
    //console.log(`TRANSITION LOG: \n`, tx.receipt.event_logs[0]);

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 5. Deploy LAUNCHER
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    contractName = 'Launcher';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';

    hardcode = {};
    hardcode["0xf36c5ca7c6f696d15c0bfbcb4d257655c1c45cd4"] = CONTRACTS["Register"];
    hardcode["0x092538858d508332b010fc16e4f07f4e3e27c7a5"] = CONTRACTS["HUSD"];
    hardcode["0x61fdb6fc6d53e6df1a3136a441232cf06dab7aed"] = CONTRACTS["HEX"];
    
    var initial_fee = 30;
    init = [ 
      { vname: '_scilla_version', type: 'Uint32', value: '0'},
      { vname: 'owner', type: 'ByStr20', value: setup.addresses[0]},
    ];

    gas = { "gas_limit": Long.fromNumber(60000), "attempts": 33, "timeout": 1000, };

    [tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    console.log( contractName,"contract deployed @ ", sc.address);

    CONTRACTS[contractName] = sc.address;  
    
    ////////////////////////////////////////////////////////////
    // 5a. Call "SetLauncherAddressState" 
    ////////////////////////////////////////////////////////////
    
    gas = { "gas_limit": Long.fromNumber(8000), "attempts": 33, "timeout": 1000, };

    args = [];

    tx = await sc_call(sc, "SetLauncherAddressState", args, gas);
    //console.log(`TRANSITION LOG: \n`, tx.receipt.event_logs[0]);

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // CREATE JSON FILES CONTAINING ALL ADDRESSES
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    const data = JSON.stringify(CONTRACTS);

    try {
    fs.writeFileSync('0_contracts.json', data);
    console.log("JSON data is saved.");
    } catch (error) {
    console.error(err);
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    

  }catch (err) {
    console.log(err);
  }
}

testBlockchain();
