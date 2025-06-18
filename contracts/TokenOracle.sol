// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import './Token.sol';

interface IEOFeedAdapter {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  )
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}

/**
 * @title TokenOracle
 * @dev Oracle contract for getting token price using ePrice
 */
contract TokenOracle {
  Token public immutable token;
  IEOFeedAdapter public immutable feedAdapter;

  // Events
  event PriceUpdated(int256 price, uint256 timestamp);
  event FeedAdapterUpdated(address newFeedAdapter);

  /**
   * @dev Constructor sets up the token and price feed adapter
   * @param _token Address of the token contract
   * @param _feedAdapter Address of the ePrice feed adapter
   */
  constructor(address _token, address _feedAdapter) {
    require(_token != address(0), 'Invalid token address');
    require(_feedAdapter != address(0), 'Invalid feed adapter address');

    token = Token(_token);
    feedAdapter = IEOFeedAdapter(_feedAdapter);
  }

  /**
   * @dev Get the latest token price
   * @return price The latest token price
   * @return timestamp When the price was last updated
   */
  function getLatestPrice() public view returns (int256 price, uint256 timestamp) {
    (, price, , timestamp, ) = feedAdapter.latestRoundData();
    return (price, timestamp);
  }

  /**
   * @dev Get token price for a specific round
   * @param _roundId The round ID to get price for
   * @return price The token price for the specified round
   * @return timestamp When the price was updated
   */
  function getPriceForRound(uint80 _roundId) public view returns (int256 price, uint256 timestamp) {
    (, price, , timestamp, ) = feedAdapter.getRoundData(_roundId);
    return (price, timestamp);
  }

  /**
   * @dev Get token decimals
   * @return The number of decimals for the price feed
   */
  function getDecimals() public view returns (uint8) {
    return feedAdapter.decimals();
  }

  /**
   * @dev Get feed description
   * @return The description of the price feed
   */
  function getDescription() public view returns (string memory) {
    return feedAdapter.description();
  }

  /**
   * @dev Get feed version
   * @return The version of the price feed
   */
  function getVersion() public view returns (uint256) {
    return feedAdapter.version();
  }
}
