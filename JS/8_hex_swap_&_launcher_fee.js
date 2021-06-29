const fs = require('fs');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { BN, Long, units, bytes } = require('@zilliqa-js/util');
const {
	getAddressFromPrivateKey,
	getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');
	const {privateKeys, server}  = require('./0_secrets_ceres.json');
	const CONTRACTS = require('./0_contracts.json');

	let setup = {
		"zilliqa": new Zilliqa(server.api),
		"VERSION": bytes.pack(server.chainId, server.msgVersion),
		"priv_keys": privateKeys,
		"addresses": [],
		"pub_keys": [],
	};
	setup.priv_keys.forEach( item => {
 		setup.zilliqa.wallet.addByPrivateKey(item);// add key to wallet
 		setup.addresses.push(getAddressFromPrivateKey(item)); // compute and store address
 		setup.pub_keys.push(getPubKeyFromPrivateKey(item)); // compute and store public key
 	});

	const base_tx_settings = {
		"gas_price": units.toQa('3000', units.Units.Li),
		"gas_limit": Long.fromNumber(50000),
		"attempts": Long.fromNumber(33),
		"timeout": 1000,
	};



	// read a file and return contents as a string
	function read(f)
	{
		t = fs.readFileSync(f, 'utf8', (err,txt) => {
			if (err) throw err;
		});
		return t;
	}

// deploy a smart contract whose code is in a file with given init arguments
async function deploy_from_file(path, init, gas = base_tx_settings.gas_limit, hardcode = {}, tx_settings = base_tx_settings)
{
	var code = read(path);
	for(var k in hardcode){ code = code.replace(k, hardcode[k]); }

		const contract = setup.zilliqa.contracts.new(code, init);
	return contract.deploy(
		{ version: setup.VERSION, gasPrice: tx_settings.gas_price, gasLimit: gas, },
		tx_settings.attempts, tx_settings.timeoute, false
		);
}


async function sc_call(sc, transition, args = [], 
	caller_pub_key = setup.pub_keys[0], gas = base_tx_settings.gas_limit, 
	amt = new BN(0), tx_settings = base_tx_settings 
	)
{
	return sc.call(
		transition,
		args,
		{ version: setup.VERSION, amount: amt, gasPrice: tx_settings.gas_price,
			gasLimit: gas, pubKey: caller_pub_key, },
			tx_settings.attempts, tx_settings.timeout, true,
			);
}

function consoleLog( title, output1, array1, array2){

    console.log("++++++++++++++++++++++++++++++++++++");
    console.log("++++++++++++++++++++++++++++++++++++");
    console.log("--------  ",title," START ----");
    console.log("++++++++++++++++++++++++++++++++++++");
    console.log("++++++++++++++++++++++++++++++++++++");
    
    console.log(output1);

    console.log("#####################################");
    console.log("#########          2        #########");
    console.log("#####################################");
        
    console.dir(array1, { depth: null }); 

    console.log("#####################################");
    console.log("###########      3       ############");
    console.log("#####################################");
    
    console.dir(array2, { depth: null }); 

    console.log("------------------------------------");
    console.log("------------------------------------");
    console.log("-------- ", title, " END    ----");
    console.log("------------------------------------");
    console.log("------------------------------------");

}

async function increaseAllowance(tokenAddress, contractAddress, senderPubKey, amount){

    console.log(contractAddress);
    
    var Token = setup.zilliqa.contracts.at(tokenAddress);
    var transition = 'IncreaseAllowance';
    var args = [
    { vname: 'spender', type: 'ByStr20', value: contractAddress },
    { vname: 'amount', type: 'Uint128', value: amount.toString() },
    ];
    var gas = Long.fromNumber(20000);
    var tx = await sc_call(Token, transition, args, senderPubKey, gas);
    console.log("tx.receipt:\n",tx.receipt);

}



async function run()
{

		//MARKET PARTICIPANTS PUBLIC KEYS
		const owner = setup.pub_keys[0];
		const influencer1 = setup.pub_keys[1];
		const influencer2 = setup.pub_keys[2];
		const influencer3 = setup.pub_keys[3];
		const sponsor1 = setup.pub_keys[4];
		const sponsor2 = setup.pub_keys[5];
		const trader1 = setup.pub_keys[6];
		const trader2 = setup.pub_keys[7];
		const trader3 = setup.pub_keys[8];

		//MARKET PARTICIPANTS PUBLIC KEYS
		const owner_Address = setup.addresses[0];
		const influencer1_Address = setup.addresses[1];
		const influencer2_Address = setup.addresses[2];
		const influencer3_Address = setup.addresses[3];
		const sponsor1_Address = setup.addresses[4];
		const sponsor2_Address = setup.addresses[5];
		const trader1_Address = setup.addresses[6];
		const trader2_Address = setup.addresses[7];
		const trader3_Address = setup.addresses[8];

		//INFLUENCER TOKENS
        var TokenAddress1 = CONTRACTS[influencer1_Address];
        var TokenAddress2 = CONTRACTS[influencer2_Address];
        var TokenAddress3 = CONTRACTS[influencer3_Address];

        //CORE CONTRACTS 
        var Oracle = setup.zilliqa.contracts.at(CONTRACTS.Oracle);
        var Register = setup.zilliqa.contracts.at(CONTRACTS.Register);
        var HUSD = setup.zilliqa.contracts.at(CONTRACTS.HUSD);
        var HEX = setup.zilliqa.contracts.at(CONTRACTS.HEX);
        var Launcher = setup.zilliqa.contracts.at(CONTRACTS.Launcher);

        //TOKEN CONTRACTS
        var InfluencerToken1 = setup.zilliqa.contracts.at(TokenAddress1);
        var InfluencerToken2 = setup.zilliqa.contracts.at(TokenAddress2);
        var InfluencerToken3 = setup.zilliqa.contracts.at(TokenAddress3);

        //TX SETTINGS : ONLY WHEN REQUIRED
        const tx_settings = {
         "gas_price": units.toQa('3000', units.Units.Li),
         "gas_limit": Long.fromNumber(50000),
         "attempts": Long.fromNumber(33),
         "timeout": 1000,
     };

		//GAS LIMIT: ONLY WHEN REQUIRED
		var gas = Long.fromNumber(50000);
		

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 1. Call "SwapTokensForExactHUSD" from HEX
    // -  Called by Traders
    // -  Traders also need to call "IncreaseAllowance" from HUSD
    // to give funds to HEX
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
   

    var amount = 40000;
    var min_amount = 10
    await increaseAllowance(CONTRACTS.HUSD, CONTRACTS.HEX, trader1, amount);
    var transition = 'SwapExactHUSDForTokens';
    var args = [
    { vname: 'token_address', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'husd_amount', type: 'Uint128', value: amount.toString() },
    { vname: 'min_token_amount', type: 'Uint128', value: min_amount.toString() },
    { vname: 'deadline_block', type: 'BNum', value: '50000' },
    { vname: 'recipient_address', type: 'ByStr20', value: trader1_Address },
    ];
    var gas = Long.fromNumber(50000);
    var tx = await sc_call(HEX, transition, args, trader1, gas);
    consoleLog("TRANSACTION LOG ", tx.receipt, [], []);
 
    var st = await InfluencerToken1.getState();
    consoleLog( "TOKEN STATE ", st, [], []);
   
    var st = await HEX.getState();
    consoleLog( "HEX STATE ", st, st.balances, st.pools);
    
/*
    var amount = 55000;
    var min_amount = 10
    await increaseAllowance(CONTRACTS.HUSD, CONTRACTS.HEX, trader2, amount);
    var transition = 'SwapExactHUSDForTokens';
    var args = [
    { vname: 'token_address', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'husd_amount', type: 'Uint128', value: amount.toString() },
    { vname: 'min_token_amount', type: 'Uint128', value: min_amount.toString() },
    { vname: 'deadline_block', type: 'BNum', value: '50000' },
    { vname: 'recipient_address', type: 'ByStr20', value: trader2_Address },
    ];
    var gas = Long.fromNumber(50000);
    console.log("test11111111111");
    var tx = await sc_call(HEX, transition, args, trader2, gas);


    console.log("tx.receipt:\n",tx.receipt);
    console.log("test11111111111");
    

    
    console.log("test3333333333333333333");
    var st = await HEX.getState();
    console.log(st);
    console.log(st.pools);
    console.log("test3333333333333333333");


    var st = await InfluencerToken1.getState();
    console.log(st);
   
  */  
       ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 2. Call "SwapExactTokensForHUSD" from HEX
    // -  Called by Traders
    // -  Traders also need to call "IncreaseAllowance" from HUSD
    // to give funds to HEX
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
   
/*
    var amount = 5000;
    var min_amount = 10
    await increaseAllowance(CONTRACTS[influencer1_Address], CONTRACTS.HEX, trader2, amount);
   
    var transition = 'SwapExactTokensForHUSD';
    var args = [
    { vname: 'token_address', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'token_amount', type: 'Uint128', value: amount.toString() },
    { vname: 'min_husd_amount', type: 'Uint128', value: min_amount.toString() },
    { vname: 'deadline_block', type: 'BNum', value: '50000' },
    { vname: 'recipient_address', type: 'ByStr20', value: trader2_Address },
    ];
    var gas = Long.fromNumber(50000);
    console.log("test11111111111");
    var tx = await sc_call(HEX, transition, args, trader2, gas);
    console.log("tx.receipt:\n",tx.receipt);
    console.log("test11111111111");

    console.log("test3333333333333333333");
    var st = await HEX.getState();
    console.log(st);
    console.log(st.pools);
    console.log("test3333333333333333333");
    var st = await InfluencerToken1.getState();
    console.log(st);
*/

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 3. Call "SwapHUSDForExactTokens" from HEX
    // -  Called by Traders
    // -  Traders also need to call "IncreaseAllowance" from HUSD
    // to give funds to HEX
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

 /*
    var max_amount = 40000;
    var amount = 6000;
    await increaseAllowance(CONTRACTS.HUSD, CONTRACTS.HEX, trader3, max_amount);
   

   
    var transition = 'SwapHUSDForExactTokens';
    var args = [
    { vname: 'token_address', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'max_husd_amount', type: 'Uint128', value: max_amount.toString() },
    { vname: 'token_amount', type: 'Uint128', value: amount.toString() },
    { vname: 'deadline_block', type: 'BNum', value: '50000' },
    { vname: 'recipient_address', type: 'ByStr20', value: trader3_Address },
    ];
    var gas = Long.fromNumber(50000);
    console.log("test11111111111");
    var tx = await sc_call(HEX, transition, args, trader3, gas);
    console.log("tx.receipt:\n",tx.receipt);
    console.log("test11111111111");

    console.log("test3333333333333333333");
    var st = await HEX.getState();
    console.log(st);
    console.log(st.pools);
    console.log("test3333333333333333333");
    var st = await InfluencerToken1.getState();
    console.log(st);

*/

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 4. Call "SwapTokensForExactHUSD" from HEX
    // -  Called by Traders
    // -  Traders also need to call "IncreaseAllowance" from HUSD
    // to give funds to HEX
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    /*

    var max_amount = 6000;
    var amount = 20000;
    await increaseAllowance(CONTRACTS[influencer1_Address], CONTRACTS.HEX, trader1, max_amount);
   
   
    var transition = 'SwapTokensForExactHUSD';
    var args = [
    { vname: 'token_address', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'max_token_amount', type: 'Uint128', value: max_amount.toString() },
    { vname: 'husd_amount', type: 'Uint128', value: amount.toString() },
    { vname: 'deadline_block', type: 'BNum', value: '50000' },
    { vname: 'recipient_address', type: 'ByStr20', value: trader1_Address },
    ];
    var gas = Long.fromNumber(50000);
    console.log("test11111111111");
    var tx = await sc_call(HEX, transition, args, trader1, gas);
    console.log("tx.receipt:\n",tx.receipt);
    console.log("test11111111111");

    console.log("test3333333333333333333");
    var st = await HEX.getState();
    console.log(st);
    console.log(st.pools);
    console.log("test3333333333333333333");
    var st = await InfluencerToken1.getState();
    console.log(st);

   */ 
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

}

run();
