import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Voting } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('Voting', function () {
  let voting: Voting;
  let candidate1: SignerWithAddress;
  let candidate2: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  beforeEach(async function () {
    [, candidate1, candidate2, voter1, voter2] = await ethers.getSigners();
    voting = await ethers.deployContract('Voting');
  });

  describe('addCandidate', function () {
    it('should add candidate by owner', async function () {
      await voting.addCandidate(candidate1.address, 'Candidate 1');
      const candidate = await voting.getCandidate(candidate1.address);
      expect(candidate.name).to.equal('Candidate 1');
      expect(candidate.voteCount).to.equal(0);
      expect(candidate.exists).to.be.true;
    });

    it('should not add candidate by non-owner', async function () {
      await expect(
        voting.connect(voter1).addCandidate(candidate1.address, 'Candidate 1'),
      ).to.be.revertedWith('Only owner can call this function');
    });

    it('should not add candidate with empty name', async function () {
      await expect(voting.addCandidate(candidate1.address, '')).to.be.revertedWith(
        'Name cannot be empty',
      );
    });

    it('should not add candidate with zero address', async function () {
      await expect(voting.addCandidate(ethers.ZeroAddress, 'Candidate 1')).to.be.revertedWith(
        'Invalid candidate address',
      );
    });

    it('should not add candidate twice', async function () {
      await voting.addCandidate(candidate1.address, 'Candidate 1');
      await expect(voting.addCandidate(candidate1.address, 'Candidate 1')).to.be.revertedWith(
        'Candidate already exists',
      );
    });
  });

  describe('vote', function () {
    beforeEach(async function () {
      await voting.addCandidate(candidate1.address, 'Candidate 1');
      await voting.addCandidate(candidate2.address, 'Candidate 2');
    });

    it('should allow voting for candidate', async function () {
      await voting.connect(voter1).vote(candidate1.address);
      const candidate = await voting.getCandidate(candidate1.address);
      expect(candidate.voteCount).to.equal(1);
      expect(await voting.hasVoted(voter1.address)).to.be.true;
    });

    it('should not allow voting twice', async function () {
      await voting.connect(voter1).vote(candidate1.address);
      await expect(voting.connect(voter1).vote(candidate2.address)).to.be.revertedWith(
        'Already voted',
      );
    });

    it('should not allow voting for non-existent candidate', async function () {
      await expect(voting.connect(voter1).vote(voter1.address)).to.be.revertedWith(
        'Candidate does not exist',
      );
    });

    it('should not allow voting for yourself', async function () {
      await expect(voting.connect(candidate1).vote(candidate1.address)).to.be.revertedWith(
        'Cannot vote for yourself',
      );
    });
  });

  describe('getResults', function () {
    beforeEach(async function () {
      await voting.addCandidate(candidate1.address, 'Candidate 1');
      await voting.addCandidate(candidate2.address, 'Candidate 2');
      await voting.connect(voter1).vote(candidate1.address);
      await voting.connect(voter2).vote(candidate1.address);
    });

    it('should return all candidates with their votes', async function () {
      const results = await voting.getResults();
      expect(results.length).to.equal(2);
      
      // Check first candidate
      expect(results[0].name).to.equal('Candidate 1');
      expect(results[0].voteCount).to.equal(2);
      expect(results[0].exists).to.be.true;

      // Check second candidate
      expect(results[1].name).to.equal('Candidate 2');
      expect(results[1].voteCount).to.equal(0);
      expect(results[1].exists).to.be.true;
    });
  });

  describe('getCandidatesCount', function () {
    it('should return correct number of candidates', async function () {
      expect(await voting.getCandidatesCount()).to.equal(0);
      
      await voting.addCandidate(candidate1.address, 'Candidate 1');
      expect(await voting.getCandidatesCount()).to.equal(1);
      
      await voting.addCandidate(candidate2.address, 'Candidate 2');
      expect(await voting.getCandidatesCount()).to.equal(2);
    });
  });
});
