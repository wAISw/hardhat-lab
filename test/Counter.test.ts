import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Counter } from '../typechain-types';

describe('Counter', function () {
  let counter: Counter;

  beforeEach(async function () {
    counter = await ethers.deployContract('Counter');
  });

  it('Should start with count 0', async function () {
    expect(await counter.getCount()).to.equal(0);
  });

  it('Should increment count', async function () {
    await counter.increment();
    expect(await counter.getCount()).to.equal(1);
  });
});
