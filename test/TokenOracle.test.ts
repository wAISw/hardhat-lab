import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Token, TokenOracle, MockFeedAdapter } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('TokenOracle', function () {
  let token: Token;
  let tokenOracle: TokenOracle;
  let mockFeedAdapter: MockFeedAdapter;
  let owner: SignerWithAddress;
  let accounts: SignerWithAddress[];

  beforeEach(async function () {
    [owner, ...accounts] = await ethers.getSigners();

    // Deploy Token contract
    token = await ethers.deployContract('Token', ['Oracle Token', 'ORT', 1000000]);

    // Deploy Mock Feed Adapter
    mockFeedAdapter = await ethers.deployContract('MockFeedAdapter');

    // Deploy TokenOracle
    tokenOracle = await ethers.deployContract('TokenOracle', [
      await token.getAddress(),
      await mockFeedAdapter.getAddress()
    ]);
  });

  describe('Deployment', function () {
    it('Should set the correct token address', async function () {
      expect(await tokenOracle.token()).to.equal(await token.getAddress());
    });

    it('Should set the correct feed adapter address', async function () {
      expect(await tokenOracle.feedAdapter()).to.equal(await mockFeedAdapter.getAddress());
    });

    it('Should fail with zero token address', async function () {
      await expect(
        ethers.deployContract('TokenOracle', [ethers.ZeroAddress, await mockFeedAdapter.getAddress()])
      ).to.be.revertedWith('Invalid token address');
    });

    it('Should fail with zero feed adapter address', async function () {
      await expect(
        ethers.deployContract('TokenOracle', [await token.getAddress(), ethers.ZeroAddress])
      ).to.be.revertedWith('Invalid feed adapter address');
    });
  });

  describe('Price retrieval', function () {
    it('Should return the latest price', async function () {
      const [price, timestamp] = await tokenOracle.getLatestPrice();
      
      expect(price).to.equal(100000000000); // $1000 with 8 decimals
      expect(timestamp).to.be.gt(0);
    });

    it('Should return price for specific round', async function () {
      // Set a new price for round 2
      const newPrice = 150000000000; // $1500 with 8 decimals
      await mockFeedAdapter.setPrice(newPrice);

      const [price, timestamp] = await tokenOracle.getPriceForRound(2);
      
      expect(price).to.equal(newPrice);
      expect(timestamp).to.be.gt(0);
    });

    it('Should fail when getting price for non-existent round', async function () {
      await expect(tokenOracle.getPriceForRound(999)).to.be.revertedWith('Round not found');
    });

    it('Should return updated price after feed adapter price change', async function () {
      const newPrice = 200000000000; // $2000 with 8 decimals
      await mockFeedAdapter.setPrice(newPrice);

      const [price] = await tokenOracle.getLatestPrice();
      expect(price).to.equal(newPrice);
    });
  });

  describe('Feed adapter metadata', function () {
    it('Should return correct decimals', async function () {
      expect(await tokenOracle.getDecimals()).to.equal(18);
    });

    it('Should return correct description', async function () {
      expect(await tokenOracle.getDescription()).to.equal('Mock Price Feed');
    });

    it('Should return correct version', async function () {
      expect(await tokenOracle.getVersion()).to.equal(1);
    });
  });

  describe('Historical data', function () {
    it('Should track multiple price updates', async function () {
      const prices = [120000000000, 180000000000, 250000000000]; // $1200, $1800, $2500
      
      // Set multiple prices
      for (let i = 0; i < prices.length; i++) {
        await mockFeedAdapter.setPrice(prices[i]);
      }

      // Check that we can retrieve each round's data
      for (let i = 0; i < prices.length; i++) {
        const roundId = i + 2; // Starting from round 2 (1 is initial)
        const [price] = await tokenOracle.getPriceForRound(roundId);
        expect(price).to.equal(prices[i]);
      }

      // Latest should be the last price
      const [latestPrice] = await tokenOracle.getLatestPrice();
      expect(latestPrice).to.equal(prices[prices.length - 1]);
    });

    it('Should handle custom round data', async function () {
      const customRoundId = 5;
      const customPrice = 300000000000; // $3000
      const customTimestamp = Math.floor(Date.now() / 1000);

      await mockFeedAdapter.setRoundData(
        customRoundId,
        customPrice,
        customTimestamp,
        customTimestamp
      );

      const [price, timestamp] = await tokenOracle.getPriceForRound(customRoundId);
      expect(price).to.equal(customPrice);
      expect(timestamp).to.equal(customTimestamp);
    });
  });
});
