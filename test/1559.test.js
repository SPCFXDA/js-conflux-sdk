const { Conflux, Drip } = require('../src');

const { TEST_KEY } = require('./index');
const NET8888_URL = "https://net8888cfx.confluxrpc.com";
const NET8888_ID = 8888;

const conflux = new Conflux({
  url: NET8888_URL,
  networkId: NET8888_ID,
  // logger: console,
});

// net8888:aasm4c231py7j34fghntcfkdt2nm9xv1tup330k3e4
// Note: This account need to be funded in the respective network, otherwise the test will fail
const account = conflux.wallet.addPrivateKey(TEST_KEY);

test('Test 1559 Base', async () => {
  const block = await conflux.cfx.getBlockByEpochNumber('latest_state', false);
  expect(block).toHaveProperty('baseFeePerGas');

  const receipt = await conflux.cfx.sendTransaction({
    type: 2,
    from: account.address,
    to: account.address,
    accessList: [{
      address: account.address,
      storageKeys: ["0x0000000000000000000000000000000000000000000000000000000000000001"],
    }],
    value: 1,
  }).executed();

  expect(receipt.type).toBe(2);
  expect(receipt).toHaveProperty('burntGasFee');
  expect(receipt).toHaveProperty('effectiveGasPrice');

  const tx = await conflux.cfx.getTransactionByHash(receipt.transactionHash);
  expect(tx.type).toBe(2);
  expect(tx).toHaveProperty('maxPriorityFeePerGas');
  expect(tx).toHaveProperty('maxFeePerGas');
  expect(tx).toHaveProperty('accessList');
  expect(tx).toHaveProperty('yParity');
});