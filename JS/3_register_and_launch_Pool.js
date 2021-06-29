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

		//CORE CONTRACTS 
		var Oracle = setup.zilliqa.contracts.at(CONTRACTS.Oracle);
		var Register = setup.zilliqa.contracts.at(CONTRACTS.Register);
		var HUSD = setup.zilliqa.contracts.at(CONTRACTS.HUSD);
		var HEX = setup.zilliqa.contracts.at(CONTRACTS.HEX);
		var Launcher = setup.zilliqa.contracts.at(CONTRACTS.Launcher);

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
    // 1. Call "InsertLink" from Oracle
    // -  Called only by Oracle owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'InsertLink';
    var args = [
    { vname: 'link', type: 'String', value: 'TESTLINK4' },
    { vname: 'name', type: 'String', value: 'TESTNAME4' }
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kendalljenner/' },
    { vname: 'name', type: 'String', value: 'Kendall Jenner' }
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kyliejenner/' },
    { vname: 'name', type: 'String', value: 'Kylie Jenner' }
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kimkardashian/' },
    { vname: 'name', type: 'String', value: 'Kim Kardashian' }
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    console.log("tx.receipt:\n",tx.receipt);

    var st = await Oracle.getState();
    console.log(st);

		////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 1a. Call "DeleteLink" from Oracle
    // -  Called only by Oracle owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'DeleteLink';
    var args = [
    { vname: 'link', type: 'String', value: 'TESTLINK4' },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    console.log("tx.receipt:\n",tx.receipt);

    var st = await Oracle.getState();
    console.log(st);

		////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 2. Call "RegisterLink" from Oracle
    // -  Called only by Anyone
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'RegisterLink';

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kimkardashian/' },
    ];
    var tx = await sc_call(Register, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kyliejenner/' },
    ];
    var tx = await sc_call(Register, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kendalljenner/' },
    ];
    var tx = await sc_call(Register, transition, args, owner, gas);


    console.log("tx.receipt:\n",tx.receipt);

    var st = await Register.getState();
    console.log(st);

		////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 3. Call "VerifyLink" from Oracle
    // -  Called only by Oracle owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'VerifyLink';

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kimkardashian/' },
    { vname: 'wallet', type: 'ByStr20', value: setup.addresses[1] },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kyliejenner/' },
    { vname: 'wallet', type: 'ByStr20', value: setup.addresses[2] },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);


    var args = [
    { vname: 'link', type: 'String', value: 'https://www.instagram.com/kendalljenner/' },
    { vname: 'wallet', type: 'ByStr20', value: setup.addresses[3] },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    console.log("tx.receipt:\n",tx.receipt);

    var st = await Oracle.getState();
    console.log(st);

		////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 4. Call "Transfer" from Oracle
    // -  Owner Dustribute some HUSD(Later actually HASH) 
    // -  to traders ans sponsors
    // -  To be called only once
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'Transfer';

    var args = [
    { vname: 'to', type: 'ByStr20', value: setup.addresses[4] },
    { vname: 'amount', type: 'Uint128', value: '1000000' },
    ];
    var tx = await sc_call(HUSD, transition, args, owner, gas);

    var args = [
    { vname: 'to', type: 'ByStr20', value: setup.addresses[5] },
    { vname: 'amount', type: 'Uint128', value: '2000000' },
    ];
    var tx = await sc_call(HUSD, transition, args, owner, gas);

    var args = [
    { vname: 'to', type: 'ByStr20', value: setup.addresses[6] },
    { vname: 'amount', type: 'Uint128', value: '3000000' },
    ];
    var tx = await sc_call(HUSD, transition, args, owner, gas);

    var args = [
    { vname: 'to', type: 'ByStr20', value: setup.addresses[7] },
    { vname: 'amount', type: 'Uint128', value: '4000000' },
    ];
    var tx = await sc_call(HUSD, transition, args, owner, gas);

    var args = [
    { vname: 'to', type: 'ByStr20', value: setup.addresses[8] },
    { vname: 'amount', type: 'Uint128', value: '5000000' },
    ];
    var tx = await sc_call(HUSD, transition, args, owner, gas);

    console.log("tx.receipt:\n",tx.receipt);

    var st = await HUSD.getState();
    console.log(st);


		////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 5. Call "RequestToken" from Oracle
    // -  Called only by Anyone
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'RequestToken';

    var args = [
    { vname: 'name', type: 'String', value: 'Kim Kardashian' },
    { vname: 'symbol', type: 'String', value: 'KIMT' },
    { vname: 'decimals', type: 'Uint32', value: '18' },
    { vname: 'supply', type: 'Uint128', value: '9000000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer1, gas);

    var args = [
    { vname: 'name', type: 'String', value: 'Kylie Jenner' },
    { vname: 'symbol', type: 'String', value: 'KYT' },
    { vname: 'decimals', type: 'Uint32', value: '18' },
    { vname: 'supply', type: 'Uint128', value: '8000000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer2, gas);

    var args = [
    { vname: 'name', type: 'String', value: 'Kendall Jenner' },
    { vname: 'symbol', type: 'String', value: 'KJT' },
    { vname: 'decimals', type: 'Uint32', value: '18' },
    { vname: 'supply', type: 'Uint128', value: '7000000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer3, gas);


    console.log("tx.receipt:\n",tx.receipt);

    var st = await Oracle.getState();
    console.log(st);


    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 6. Deploy Influencer Token Contracts
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    var contractFolder = '../Scilla';
    contractName = 'HRCtoken';
    contractFilePath = contractFolder + '/' + contractName + '.scilla';
    
    hardcode = {};
    hardcode["0xef4dd079a0ca5428b58558089de38161a2eefa34"] = CONTRACTS["Oracle"];
    hardcode["0x60c04dcb5884f9a78411a6d763a542dc6cc3710c"] = CONTRACTS["Launcher"];

    if(CONTRACTS[influencer1_Address] === undefined){

    	init = [ 
    	{ vname: '_scilla_version', type: 'Uint32', value: '0'},
    	{ vname: 'contract_owner', type: 'ByStr20', value: influencer1_Address},
    	{ vname: 'name', type: 'String', value: 'Kim Kardashian' },
    	{ vname: 'symbol', type: 'String', value: 'KIMT' },
    	{ vname: 'decimals', type: 'Uint32', value: '18' },
    	{ vname: 'init_supply', type: 'Uint128', value: '9000000' },
    	];

    	[tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    	console.log(contractName,"contract deployed @ ", sc.address);

    	CONTRACTS[influencer1_Address] = sc.address;  

    }

    if(CONTRACTS[influencer2_Address] === undefined){

    	init = [ 
    	{ vname: '_scilla_version', type: 'Uint32', value: '0'},
    	{ vname: 'contract_owner', type: 'ByStr20', value: influencer2_Address},
    	{ vname: 'name', type: 'String', value: 'Kylie Jenner' },
    	{ vname: 'symbol', type: 'String', value: 'KYT' },
    	{ vname: 'decimals', type: 'Uint32', value: '18' },
    	{ vname: 'init_supply', type: 'Uint128', value: '8000000' },
    	];

    	[tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    	console.log(contractName,"contract deployed @ ", sc.address);

    	CONTRACTS[influencer2_Address] = sc.address;  

    }

    if(CONTRACTS[influencer3_Address] === undefined){

    	init = [ 
    	{ vname: '_scilla_version', type: 'Uint32', value: '0'},
    	{ vname: 'contract_owner', type: 'ByStr20', value: influencer3_Address},
    	{ vname: 'name', type: 'String', value: 'Kendall Jenner' },
    	{ vname: 'symbol', type: 'String', value: 'KJT' },
    	{ vname: 'decimals', type: 'Uint32', value: '18' },
    	{ vname: 'init_supply', type: 'Uint128', value: '7000000' },
    	];

    	[tx, sc] = await deploy_from_file(contractFilePath, init, gas, hardcode);
    	console.log(contractName,"contract deployed @ ", sc.address);

    	CONTRACTS[influencer3_Address] = sc.address;  

    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // CREATE JSON FILES CONTAINING ALL INFLUENCER TOKEN ADDRESSES
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
    // 7. Call "VerifyTokenStart" from Oracle
    // -  Called only by Owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    var transition = 'VerifyTokenStart';

    var args = [
    { vname: 'token', type: 'ByStr20', value: CONTRACTS[influencer1_Address] },
    { vname: 'wallet', type: 'ByStr20', value: influencer1_Address },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

		var args = [
    { vname: 'token', type: 'ByStr20', value: CONTRACTS[influencer2_Address] },
    { vname: 'wallet', type: 'ByStr20', value: influencer2_Address },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

		var args = [
    { vname: 'token', type: 'ByStr20', value: CONTRACTS[influencer3_Address] },
    { vname: 'wallet', type: 'ByStr20', value: influencer3_Address },
    ];
    var tx = await sc_call(Oracle, transition, args, owner, gas);

    console.log("tx.receipt:\n",tx.receipt);

    var st = await Register.getState();
    console.log(st);

    ////////////////////////////////////////////////////////////
    // 7a. Check State of Influencer token 
    ////////////////////////////////////////////////////////////
    
    var InfluencerToken = setup.zilliqa.contracts.at(CONTRACTS[influencer1_Address]);
    var st = await InfluencerToken.getState();
    console.log(st);

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // 8. Call "LaunchSponsorPool" from Oracle
    // -  Called only by Owner
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////


    var transition = 'TESTHardcodedValues';
    var args = [];
    var tx = await sc_call(Launcher, transition, args, influencer1, gas);
    console.log("tx.receipt:\n",tx.receipt);


    var transition = 'LaunchSponsorPool';

    var args = [
    { vname: 'price', type: 'Uint128', value: '5' },
    { vname: 'liquidity', type: 'Uint128', value: '100000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer1, gas);


		var args = [
    { vname: 'price', type: 'Uint128', value: '4' },
    { vname: 'liquidity', type: 'Uint128', value: '90000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer2, gas);


		var args = [
    { vname: 'price', type: 'Uint128', value: '6' },
    { vname: 'liquidity', type: 'Uint128', value: '80000' },
    ];
    var tx = await sc_call(Register, transition, args, influencer3, gas);


    console.log("tx.receipt:\n",tx.receipt);

    var st = await Launcher.getState();
    console.log(st.launchs);
    

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

  }

  run();
