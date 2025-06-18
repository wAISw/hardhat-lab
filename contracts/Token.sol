// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Token
 * @dev Task: Create a simple token with basic functionality
 *
 * Requirements:
 * 1. Add variables for name, symbol and total supply
 * 2. Add mapping to store user balances
 * 3. Implement mint function to create new tokens
 * 4. Implement transfer function to send tokens
 * 5. Add events for mint and transfer
 */
contract Token {
  string public name;
  string public symbol;
  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;

  event Transfer(address indexed from, address indexed to, uint256 amount);
  event Mint(address indexed to, uint256 amount);

  constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
    require(_totalSupply > 0, 'Total supply must be greater than 0');
    name = _name;
    symbol = _symbol;
    totalSupply = _totalSupply;
    balanceOf[msg.sender] = _totalSupply;
    emit Transfer(address(0), msg.sender, _totalSupply);
  }

  function mint(address to, uint256 amount) public {
    require(to != address(0), 'Cannot mint to zero address');
    require(amount > 0, 'Amount must be greater than 0');

    balanceOf[to] += amount;
    totalSupply += amount;

    emit Mint(to, amount);
    emit Transfer(address(0), to, amount);
  }

  function transfer(address to, uint256 amount) public {
    require(to != address(0), 'Cannot transfer to zero address');
    require(amount > 0, 'Amount must be greater than 0');
    require(balanceOf[msg.sender] >= amount, 'Insufficient balance');

    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;

    emit Transfer(msg.sender, to, amount);
  }
}
