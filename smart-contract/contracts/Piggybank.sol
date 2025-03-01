// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Piggybank {
    address public factory;
    address public owner;
    string public savingPurpose;
    uint256 public unlockTime;
    mapping(address => bool) public allowedTokens;
    mapping(address => uint256) public balances;
    bool public withdrawn;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }

    modifier isWithdrawn() {
        require(!withdrawn, "Already withdrawn");
        _;
    }

    constructor(
        address _owner,
        string memory _purpose,
        uint256 _durationInWeeks,
        address[] memory _tokens
    ) {
        factory = msg.sender;
        owner = _owner;
        savingPurpose = _purpose;
        unlockTime = block.timestamp + (_durationInWeeks * 1 weeks);

        for (uint256 i = 0; i < _tokens.length; i++) {
            require(_tokens[i] != address(0), "Invalid token address");
            allowedTokens[_tokens[i]] = true;
        }
    }

    function deposit(address token, uint256 amount) external onlyOwner {
        require(allowedTokens[token], "Token not allowed");
        require(amount > 0, "Amount must be greater than zero");

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[token] += amount;
    }

    function withdraw(address token) external onlyOwner isWithdrawn {
        require(block.timestamp >= unlockTime, "Savings period not yet over");
        _withdraw(token, false);
    }

    function emergencyWithdraw(address token) external onlyOwner isWithdrawn {
        require(block.timestamp < unlockTime, "Use regular withdraw");
        _withdraw(token, true);
    }

    function _withdraw(address token, bool isEmergency) internal {
        require(allowedTokens[token], "Token not allowed");
        require(balances[token] > 0, "No balance to withdraw");

        uint256 amount = balances[token];
        balances[token] = 0;
        withdrawn = true;

        if (isEmergency) {
            uint256 penalty = (amount * 15) / 100;
            IERC20(token).transfer(factory, penalty);
            amount -= penalty;
        }

        IERC20(token).transfer(owner, amount);
    }
}
