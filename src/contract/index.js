const lodash = require('lodash');
const { parseABIFromString } = require('abi-util-lite');
const ContractABI = require('./ContractABI');
const ContractConstructor = require('./method/ContractConstructor');
const ContractMethod = require('./method/ContractMethod');
const ContractMethodOverride = require('./method/ContractMethodOverride');
const ContractEvent = require('./event/ContractEvent');
const ContractEventOverride = require('./event/ContractEventOverride');
const ErrorCoder = require('./method/ErrorCoder');

/**
 * Contract with all its methods and events defined in its abi.
 */
class Contract {
  /**
   * > contract "code" definition:
   * ```
   * 6080................6080.................a264.........0033...............................
   * | <-                     create contract transaction `data`                          -> |
   * | <- deploy code -> | <- runtime code -> | <- metadata -> | <- constructor arguments -> |
   * | <-                contract `bytecode`                -> |
   *                     | <-       code as `getCode`       -> |
   * ```
   *
   * @param {object} options
   * @param {array} options.abi - The json interface for the contract to instantiate
   * @param {string} [options.address] - The address of the smart contract to call, can be added later using `contract.address = '0x1234...'`
   * @param {string} [options.bytecode] - The byte code of the contract, can be added later using `contract.constructor.code = '0x1234...'`
   * @param {boolean} [options.decodeByteToHex=false] - Whether decode bytes to hex string, default will decoe to Buffer.
   * @param {import('../Conflux').Conflux} conflux - Conflux instance.
   * @return {object}
   *
   * @example
   * > const contract = conflux.Contract({ abi, bytecode, address });
   {
      abi: ContractABI { contract: [Circular *1] },
      address: 'cfxtest:achc8nxj7r451c223m18w2dwjnmhkd6rxa2gc31euw',
      constructor: [Function: bound call],
      name: [Function: bound call],
      'name()': [Function: bound call],
      '0x06fdde03': [Function: bound call],
      balanceOf: [Function: bound call],
      'balanceOf(address)': [Function: bound call],
      '0x70a08231': [Function: bound call],
      send: [Function: bound call],
      'send(address,uint256,bytes)': [Function: bound call],
      '0x9bd9bbc6': [Function: bound call],
      Transfer: [Function: bound call],
      'Transfer(address,address,uint256)': [Function: bound call],
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': [Function: bound call]
   }

   * > contract.constructor.bytecode; // input code
   "0x6080..."

   * @example
   * > const contract = conflux.Contract({
   address: 'cfxtest:achc8nxj7r451c223m18w2dwjnmhkd6rxa2gc31euw',
   abi: [
      {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ type: 'string' }],
      },
      {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ type: 'address' }],
        outputs: [{ type: 'uint256' }],
      },
      {
        name: 'send',
        type: 'function',
        inputs: [
          { type: 'address', name: 'recipient' },
          { type: 'uint256', name: 'amount' },
          { type: 'bytes', name: 'data' },
        ],
        outputs: [{ type: 'bool' }],
      },
    ]
   });
   * > contract.address
   "cfxtest:achc8nxj7r451c223m18w2dwjnmhkd6rxa2gc31euw"

   * > await contract.name(); // call a method without parameter, get decoded return value.
   "FansCoin"
   * > await contract.name().call({ to: '0x8b8689c7f3014a4d86e4d1d0daaf74a47f5e0f27' }); // call a method with options
   "conflux USDT"
   * > await contract.balanceOf('0x19c742cec42b9e4eff3b84cdedcde2f58a36f44f'); // call a method with parameters, get decoded return value.
   10000000000000000000n

   * Update contract state with sendTransaction
   * > await contract.transfer('0x19c742cec42b9e4eff3b84cdedcde2f58a36f44f', 10000).sendTransaction({
     from: 'cfxtest:aak2rra2njvd77ezwjvx04kkds9fzagfe6d5r8e957',
   });
   0x2055f3287f1a6ce77d91f5dfdf7517a531b3a560fee1265f27dc1ff92314530b

   * > transaction = await conflux.getTransactionByHash('0x2055f3287f1a6ce77d91f5dfdf7517a531b3a560fee1265f27dc1ff92314530b');
   * > contract.abi.decodeData(transaction.data)
   {
      name: 'send',
      fullName: 'send(address recipient, uint256 amount, bytes data)',
      type: 'send(address,uint256,bytes)',
      signature: '0x9bd9bbc6',
      array: [
        '0x80bb30efc5683758128b404fe5da03432eb16634',
        60000000000000000000n,
        <Buffer 1f 3c 6b 96 96 60 4c dc 3c e1 ca 27 7d 4c 69 a9 c2 77 0c 9f>
      ],
      object: {
        recipient: '0x80bb30efc5683758128b404fe5da03432eb16634',
        amount: 60000000000000000000n,
        data: <Buffer 1f 3c 6b 96 96 60 4c dc 3c e1 ca 27 7d 4c 69 a9 c2 77 0c 9f>
      }
    }

   * > receipt = await conflux.getTransactionReceipt('0x2055f3287f1a6ce77d91f5dfdf7517a531b3a560fee1265f27dc1ff92314530b');
   * > contract.abi.decodeLog(receipt.logs[1]);
   {
      name: 'Transfer',
      fullName: 'Transfer(address indexed from, address indexed to, uint256 value)',
      type: 'Transfer(address,address,uint256)',
      signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      array: [
        '0x1f3c6b9696604cdc3ce1ca277d4c69a9c2770c9f',
        '0x80bb30efc5683758128b404fe5da03432eb16634',
        60000000000000000000n
      ],
      object: {
        from: '0x1f3c6b9696604cdc3ce1ca277d4c69a9c2770c9f',
        to: '0x80bb30efc5683758128b404fe5da03432eb16634',
        value: 60000000000000000000n
      }
    }
   */
  constructor({ abi, address, bytecode, decodeByteToHex }, conflux) {
    if (abi.length > 0 && typeof abi[0] === 'string') {
      abi = parseABIFromString(abi);
    }
    _feedAddressNetId(abi, conflux);
    _feedByteOption(abi, decodeByteToHex);
    const abiTable = lodash.groupBy(abi, 'type');
    this.abi = new ContractABI(this); // XXX: Create a method named `abi` in solidity is a `Warning`.

    if (address) {
      this.address = (conflux && conflux.networkId) ? conflux._formatAddress(address) : address; // XXX: Create a method named `address` in solidity is a `ParserError`
    }

    // constructor
    this.constructor = new ContractConstructor(lodash.first(abiTable.constructor), bytecode, this, conflux);

    // method
    const methodArray = lodash.map(abiTable.function, fragment => new ContractMethod(fragment, this, conflux));
    lodash.forEach(lodash.groupBy(methodArray, 'name'), (array, name) => {
      this[name] = array.length === 1 ? lodash.first(array) : new ContractMethodOverride(array, this, conflux);

      array.forEach(method => {
        this[method.type] = method;
        this[method.signature] = method; // signature for contract abi decoder to decode
      });
    });

    // event
    const eventArray = lodash.map(abiTable.event, fragment => new ContractEvent(fragment, this, conflux));
    lodash.forEach(lodash.groupBy(eventArray, 'name'), (array, name) => {
      this[name] = array.length === 1 ? lodash.first(array) : new ContractEventOverride(array, this, conflux);

      array.forEach(event => {
        this[event.type] = event;
        this[event.signature] = event; // signature for contract abi decoder to decode
      });
    });
  }

  attach(address) {
    this.address = address;
  }
}

function _feedAddressNetId(abi, conflux) {
  if (!abi || !conflux || !conflux.networkId) return;

  for (const item of abi) {
    if (['function', 'event', 'constructor'].indexOf(item.type) >= 0) {
      _feedInfo(item.inputs);
      _feedInfo(item.outputs);
    }
  }

  function _feedInfo(items = []) {
    for (const meta of items) {
      if (meta.type === 'address') {
        meta.networkId = conflux.networkId;
      }
      if (meta.type === 'tuple') {
        _feedInfo(meta.components);
      }
    }
  }
}

function _feedByteOption(abi, decodeByteToHex = false) {
  if (!abi || !decodeByteToHex) return;

  for (const item of abi) {
    if (['function', 'event', 'constructor'].indexOf(item.type) >= 0) {
      _feedOption(item.inputs);
      _feedOption(item.outputs);
    }
  }

  function _feedOption(items = []) {
    for (const meta of items) {
      if (meta.type.startsWith('bytes')) {
        meta._decodeToHex = true;
      }
      if (meta.type === 'tuple') {
        _feedOption(meta.components);
      }
    }
  }
}

module.exports = Contract;

const errorCoder = new ErrorCoder();
module.exports.decodeError = e => errorCoder.decodeError(e);
