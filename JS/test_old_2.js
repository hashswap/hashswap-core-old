const fs = require('fs');

const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
const {
  toBech32Address,
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');

const chainId = 333; // chainId of the developer testnet
const msgVersion = 1; // current msgVersion
const VERSION = bytes.pack(chainId, msgVersion);

// Populate the wallet with an account
// replace with your private key
const CONTRACTS = require('./contracts.json');
const privateKey = "d17e37b29f7d609dd39b1426159d955a4218df54da5048bed1680b345f7d9572";

const {privateKeys} = require('./secrets.json');

// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid


zilliqa.wallet.addByPrivateKey(privateKeys[0]);
zilliqa.wallet.addByPrivateKey(privateKeys[1]);

var owner = getAddressFromPrivateKey(privateKeys[1]);
console.log(owner);
console.log(zilliqa.wallet.accounts['0x8Ab010F65C7E783CA679Fa66d996970dffd58fe3']);
console.log(zilliqa.wallet.accounts[owner]);

zilliqa.wallet.setDefault(owner); 

console.log(zilliqa.wallet);

const address = getAddressFromPrivateKey(privateKey);
console.log(`My account address is: ${address}`);
console.log(`My account bech32 address is: ${toBech32Address(address)}`);



async function testBlockchain() {
  try {
    // Get Balance
    const balance = await zilliqa.blockchain.getBalance(address);
    // Get Minimum Gas Price from blockchain
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();

    // Account balance (See note 1)
    console.log(`Your account balance is:`);
    console.log(balance.result);
    console.log(`Current Minimum Gas Price: ${minGasPrice.result}`);
    const myGasPrice = units.toQa('3000', units.Units.Li); // Gas Price that will be used by all transactions
    console.log(`My Gas Price ${myGasPrice.toString()}`);
    const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price
    console.log(`Is the gas price sufficient? ${isGasSufficient}`);

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 1. Call "InsertLink" from Oracle
    // -  Called only by Oracle owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    
    const deployedRegister = zilliqa.contracts.at(CONTRACTS.Oracle);
    console.log('Calling Register transition SetRegisterOracle');
    
    var link = 'https://www.instagram.com/kyliejenner/';
    var name = 'Kylie Jenner';
     
    const args = [ { vname: 'link', type: 'String',  value: link },
                     { vname: 'name', type: 'String',  value: name }
                  ];
      

    const callTx = await deployedRegister.call(
      'InsertLink',
      args,
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(20000),
      },
      33,
      1000,
      false,
    );  
    // Retrieving the transaction receipt (See note 2)
    console.log(callTx);
    console.log(JSON.stringify(callTx.receipt, null, 4));
        //Get the contract state
    console.log('Getting Oracle state...');
    const state = await deployedRegister.getState();
    console.log('The state of the Oracle:');
    console.log(JSON.stringify(state, null, 4));  


    console.log('\n');


    ////////////////////////////////////////////////////////////
    // SetRegisterOracle
    ////////////////////////////////////////////////////////////
    
    //const deployedRegister = zilliqa.contracts.at(register.address);
    /*
    const deployedRegister = zilliqa.contracts.at(CONTRACTS.Register);
    console.log('Calling Register transition SetRegisterOracle');
    const callTx = await deployedRegister.call(
      'SetRegisterOracle',
      [],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: VERSION,
        amount: new BN(0),
        gasPrice: myGasPrice,
        gasLimit: Long.fromNumber(8000),
      },
      33,
      1000,
      false,
    );  
    // Retrieving the transaction receipt (See note 2)
    console.log(JSON.stringify(callTx.receipt, null, 4));
        //Get the contract state
    console.log('Getting Oracle state...');
    const state = await deployedRegister.getState();
    console.log('The state of the Oracle:');
    console.log(JSON.stringify(state, null, 4));  


    console.log('\n');

    */



  }catch (err) {
    console.log(err);
  }
}

testBlockchain();
