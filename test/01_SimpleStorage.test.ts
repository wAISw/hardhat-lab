import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SimpleStorage } from '../typechain-types';

describe('SimpleStorage', function () {
  let simpleStorage: SimpleStorage;

  beforeEach(async function () {
    simpleStorage = await ethers.deployContract('SimpleStorage');
  });

  it('Should start with count 0', async function () {
    expect(await simpleStorage.getValue()).to.equal(0);
  });

  it('Should set value', async function () {
    await simpleStorage.setValue(1);
    expect(await simpleStorage.getValue()).to.equal(1);
  });

  it('Should emit event when value is set', async function () {
    await expect(simpleStorage.setValue(1)).to.emit(simpleStorage, 'ValueUpdated').withArgs(1);
  });
});
