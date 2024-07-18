const { Conflux, format } = require('../../src');

const conflux = new Conflux({
  networkId: 1,
});

test('AdminControl', () => {
  const contract = conflux.InternalContract('AdminControl');

  expect(format.hexAddress(contract.address)).toEqual('0x0888000000000000000000000000000000000000');
  expect(contract.constructor).toBeDefined();
});

test('SponsorWhitelistControl', () => {
  const contract = conflux.InternalContract('SponsorWhitelistControl');

  expect(format.hexAddress(contract.address)).toEqual('0x0888000000000000000000000000000000000001');
  expect(contract.constructor).toBeDefined();
});

test('Staking', () => {
  const contract = conflux.InternalContract('Staking');

  expect(format.hexAddress(contract.address)).toEqual('0x0888000000000000000000000000000000000002');
  expect(contract.constructor).toBeDefined();
});

test('NOT EXIST', () => {
  expect(() => conflux.InternalContract('NOT EXIST')).toThrow('can not find internal contract');
});
