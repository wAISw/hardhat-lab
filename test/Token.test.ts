import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Token } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('Token', function () {
  let token: Token;
  let owner: SignerWithAddress;
  let accounts: SignerWithAddress[];

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();
    token = await ethers.deployContract('Token', ['Test Token', 'TST', 1000000]);
  });

  it('Should have correct number of test accounts', async function () {
    const allSigners = await ethers.getSigners();
    expect(allSigners.length).to.equal(20); // Hardhat creates 20 test accounts
    expect(accounts.length).to.equal(19); // owner + 19 other accounts
  });

  it('Should have correct initial values', async function () {
    expect(await token.name()).to.equal('Test Token');
    expect(await token.symbol()).to.equal('TST');
    expect(await token.totalSupply()).to.equal(1000000);
    expect(await token.balanceOf(owner.address)).to.equal(1000000);
  });

  it('Should mint new tokens', async function () {
    const amount = 1000;
    await token.mint(accounts[0].address, amount);

    expect(await token.balanceOf(accounts[0].address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(1000000 + amount);
  });

  it('Should transfer tokens', async function () {
    const amount = 1000;
    await token.transfer(accounts[0].address, amount);

    expect(await token.balanceOf(owner.address)).to.equal(1000000 - amount);
    expect(await token.balanceOf(accounts[0].address)).to.equal(amount);
  });

  it('Should fail when transferring more than balance', async function () {
    await expect(token.transfer(accounts[0].address, 1000001)).to.be.revertedWith(
      'Insufficient balance',
    );
  });

  it('Should fail when transferring to zero address', async function () {
    await expect(token.transfer(ethers.ZeroAddress, 1000)).to.be.revertedWith(
      'Cannot transfer to zero address',
    );
  });
});
