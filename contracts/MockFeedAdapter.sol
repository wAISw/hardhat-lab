// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockFeedAdapter
 * @dev Mock contract for testing TokenOracle
 */
contract MockFeedAdapter {
  uint8 public decimals = 18;
  string public description = "Mock Price Feed";
  uint256 public version = 1;

  struct Round {
    uint80 roundId;
    int256 answer;
    uint256 startedAt;
    uint256 updatedAt;
    uint80 answeredInRound;
  }

  mapping(uint80 => Round) private rounds;
  uint80 private latestRoundId = 1;
  int256 private latestPrice = 100000000000; // $1000 with 8 decimals

  constructor() {
    rounds[latestRoundId] = Round({
      roundId: latestRoundId,
      answer: latestPrice,
      startedAt: block.timestamp,
      updatedAt: block.timestamp,
      answeredInRound: latestRoundId
    });
  }

  function latestRoundData()
    external
    view
    returns (uint80, int256, uint256, uint256, uint80)
  {
    Round memory round = rounds[latestRoundId];
    return (round.roundId, round.answer, round.startedAt, round.updatedAt, round.answeredInRound);
  }

  function getRoundData(
    uint80 _roundId
  ) external view returns (uint80, int256, uint256, uint256, uint80) {
    require(_roundId > 0 && _roundId <= latestRoundId, "Round not found");
    Round memory round = rounds[_roundId];
    return (round.roundId, round.answer, round.startedAt, round.updatedAt, round.answeredInRound);
  }

  function setPrice(int256 _price) external {
    latestRoundId++;
    rounds[latestRoundId] = Round({
      roundId: latestRoundId,
      answer: _price,
      startedAt: block.timestamp,
      updatedAt: block.timestamp,
      answeredInRound: latestRoundId
    });
    latestPrice = _price;
  }

  function setRoundData(
    uint80 _roundId,
    int256 _answer,
    uint256 _startedAt,
    uint256 _updatedAt
  ) external {
    rounds[_roundId] = Round({
      roundId: _roundId,
      answer: _answer,
      startedAt: _startedAt,
      updatedAt: _updatedAt,
      answeredInRound: _roundId
    });
    if (_roundId > latestRoundId) {
      latestRoundId = _roundId;
    }
  }
} 