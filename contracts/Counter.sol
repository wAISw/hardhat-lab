// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 private count;

    event CountUpdated(uint256 newCount);

    constructor() {
        count = 0;
    }

    function increment() public {
        count += 1;
        emit CountUpdated(count);
    }

    function getCount() public view returns (uint256) {
        return count;
    }
} 