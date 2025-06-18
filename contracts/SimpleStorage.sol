// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev Simple contract for storing and changing a value
 */

contract SimpleStorage {
  uint256 private value;

  event ValueUpdated(uint256 newValue);

  constructor() {
    value = 0;
  }

  function setValue(uint256 newValue) public {
    value = newValue;
    emit ValueUpdated(value);
  }

  function getValue() public view returns (uint256) {
    return value;
  }
}
