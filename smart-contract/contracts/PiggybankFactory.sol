// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Piggybank.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PiggybankFactory {
    address public owner;
    address[] public piggybanks;
    address[] public allowedTokens;
    mapping(address => address) public piggybankOwners;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPiggybank(string memory _purpose, uint256 _durationInWeeks) external {
        require(allowedTokens.length > 0, "No allowed tokens set");

        Piggybank newPiggybank = new Piggybank(msg.sender, _purpose, _durationInWeeks, allowedTokens);
        address newPiggybankAddress = address(newPiggybank);
        piggybanks.push(newPiggybankAddress);
        piggybankOwners[newPiggybankAddress] = msg.sender;
    }

    function updateAllowedTokens(address[] memory _tokens) external onlyOwner {
        delete allowedTokens;
        
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            require(token != address(0), "Invalid token address");

            // ERC20 Validation - Ensures the token implements totalSupply()
            try IERC20(token).totalSupply() returns (uint256) {
                allowedTokens.push(token);
            } catch {
                revert("Token is not ERC20-compliant");
            }
        }
    }

    function getPiggybanks() external view returns (address[] memory) {
        return piggybanks;
    }
}
