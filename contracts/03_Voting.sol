// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @dev Task: Create a voting contract
 *
 * Requirements:
 * 1. Add a structure to store candidate information
 * 2. Add mapping to store votes
 * 3. Implement function to add candidates
 * 4. Implement function to vote
 * 5. Implement function to get results
 * 6. Add check for double voting
 * 7. Add events for candidate addition and voting
 */
contract Voting {
  struct Candidate {
    string name;
    uint256 voteCount;
    bool exists;
  }

  mapping(address => bool) public voted;
  mapping(address => Candidate) public candidates;
  address[] public candidateAddresses;
  address public owner;

  event CandidateAdded(address indexed candidateAddress, string name);
  event Voted(address indexed candidateAddress, address voter);

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner can call this function');
    _;
  }

  modifier onlyCandidate(address _candidateAddress) {
    require(candidates[_candidateAddress].exists, 'Candidate does not exist');
    _;
  }

  modifier notVoted(address _voter) {
    require(!voted[_voter], 'Already voted');
    _;
  }

  modifier notSelf(address _candidateAddress) {
    require(_candidateAddress != msg.sender, 'Cannot vote for yourself');
    _;
  }

  function addCandidate(address _candidateAddress, string memory _name) public onlyOwner {
    require(_candidateAddress != address(0), 'Invalid candidate address');
    require(bytes(_name).length > 0, 'Name cannot be empty');
    require(!candidates[_candidateAddress].exists, 'Candidate already exists');
    require(_candidateAddress.code.length == 0, 'Candidate cannot be a contract');

    candidates[_candidateAddress] = Candidate({name: _name, voteCount: 0, exists: true});

    candidateAddresses.push(_candidateAddress);
    emit CandidateAdded(_candidateAddress, _name);
  }

  function vote(
    address _candidateAddress
  ) public onlyCandidate(_candidateAddress) notVoted(msg.sender) notSelf(_candidateAddress) {
    candidates[_candidateAddress].voteCount++;
    voted[msg.sender] = true;
    emit Voted(_candidateAddress, msg.sender);
  }

  function getCandidatesCount() public view returns (uint256) {
    return candidateAddresses.length;
  }

  function getCandidate(
    address _candidateAddress
  ) public view returns (string memory name, uint256 voteCount, bool exists) {
    return (
      candidates[_candidateAddress].name,
      candidates[_candidateAddress].voteCount,
      candidates[_candidateAddress].exists
    );
  }

  function hasVoted(address _voter) public view returns (bool) {
    return voted[_voter];
  }

  function getResults() public view returns (Candidate[] memory) {
    uint256 count = candidateAddresses.length;
    Candidate[] memory results = new Candidate[](count);
    uint256 resultIndex = 0;

    for (uint256 i = 0; i < count; i++) {
      address candidateAddress = candidateAddresses[i];
      if (candidates[candidateAddress].exists) {
        results[resultIndex] = candidates[candidateAddress];
        resultIndex++;
      }
    }

    // Create a new array with the exact size
    Candidate[] memory finalResults = new Candidate[](resultIndex);
    for (uint256 i = 0; i < resultIndex; i++) {
      finalResults[i] = results[i];
    }

    return finalResults;
  }
}
