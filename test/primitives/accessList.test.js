const { AccessList } = require('../../src/primitives/AccessList');
const format = require('../../src/util/format');

const TEST_ADDRESS = '0x1123456789012345678901234567890123456789';
const TEST_BASE32_ADDRESS = 'cfx:aajwgvnhveawgvnhveawgvnhveawgvnhve8c2ukvxz';

const STORAGE_KEY3 = '0x0000000000000000000000000000000000000000000000000000000000000003';
const STORAGE_KEY7 = '0x0000000000000000000000000000000000000000000000000000000000000007';

test('AccessList', () => {
  const accessList1 = new AccessList([[TEST_ADDRESS, []]]);
  expect(accessList1.entries[0].address).toEqual(TEST_ADDRESS);
  expect(accessList1.entries[0].storageKeys).toEqual([]);

  const accessList2 = new AccessList([[TEST_ADDRESS, [STORAGE_KEY3]]]);
  expect(accessList2.entries[0].address).toEqual(TEST_ADDRESS);
  expect(accessList2.entries[0].storageKeys).toEqual([STORAGE_KEY3]);

  const accessList3 = new AccessList([{ address: TEST_ADDRESS, storageKeys: [STORAGE_KEY7] }]);
  expect(accessList3.entries[0].address).toEqual(TEST_ADDRESS);
  expect(accessList3.entries[0].storageKeys).toEqual([STORAGE_KEY7]);
});

test('AccessList Base32', () => {
  const accessList1 = new AccessList([[TEST_BASE32_ADDRESS, []]]);
  expect(accessList1.entries[0].address).toEqual(TEST_ADDRESS);
  expect(accessList1.entries[0].storageKeys).toEqual([]);

  expect(accessList1.encode()[0][0]).toEqual(format.hexBuffer(TEST_ADDRESS));
});

test('AccessList encode', () => {
  const accessList1 = new AccessList([[TEST_BASE32_ADDRESS, [STORAGE_KEY3]]]);

  expect(accessList1.encode()).toEqual([
    [format.hexBuffer(TEST_ADDRESS), [format.hexBuffer(STORAGE_KEY3)]],
  ]);
});
