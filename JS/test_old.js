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
const privateKey = "d17e37b29f7d609dd39b1426159d955a4218df54da5048bed1680b345f7d9572";

// These are set by the core protocol, and may vary per-chain.
// You can manually pack the bytes according to chain id and msg version.
// For more information: https://apidocs.zilliqa.com/?shell#getnetworkid


zilliqa.wallet.addByPrivateKey(privateKey);

const address = getAddressFromPrivateKey(privateKey);
console.log(`My account address is: ${address}`);
console.log(`My account bech32 address is: ${toBech32Address(address)}`);


// read a file and return contents as a string
function read(f)
{
  t = fs.readFileSync(f, 'utf8', (err,txt) => {
    if (err) throw err;
  });
  return t;
}


var contractFolder = '../Scilla';
    


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


    //SAVE DEPLOYED CONTRACT ADDRESS IN AN OBJECT    
    var CONTRACTS = {};
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // Deploy Oracle
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    console.log(`Deploying Oracle`);
    var contractFile = 'HEX';
    var contractFilePath = contractFolder + '/' + contractFile + '.scilla';
    const code = read(contractFilePath);

    // init for oracle
    const initial_fee = '1000';

    const init4 =  [
        // this parameter is mandatory for all init arrays
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'initial_owner',
          type: 'ByStr20',
          value: `${address}`,
        },
        {
            vname: 'initial_fee',
            type: 'Uint256',
            value: `${initial_fee}`,
        },
      ];


    // Instance of class Contract
   const contract4 = zilliqa.contracts.new(code, init4);

   // Deploy the contract.
   // Also notice here we have a default function parameter named toDs as mentioned above.
   // A contract can be deployed at either the shard or at the DS. Always set this value to false.
   const [deployTx4, hex] = await contract4.deploy(
     {
       version: VERSION,
       gasPrice: myGasPrice,
       gasLimit: Long.fromNumber(33000),
     },
     33,
     1000,
     false,
   );

    // Introspect the state of the underlying transaction
   console.log(`Deployment Transaction ID: ${deployTx4.id}`);
   console.log(`Deployment Transaction Receipt:`);
   console.log(deployTx4.txParams.receipt);   
   // Get the deployed contract address
   console.log('The contract address is : ',hex.address);

  




  }catch (err) {
    console.log(err);
  }
}

testBlockchain();
