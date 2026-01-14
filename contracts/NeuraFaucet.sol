// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

contract NeuraFaucet {
    address public owner;
    
    mapping(address => uint256) public tokenAmounts;
    mapping(address => uint256) public tokenCooldowns;
    mapping(address => mapping(address => uint256)) public lastClaim;
    
    address[] public supportedTokens;
    
    event TokenAdded(address indexed token, uint256 amount, uint256 cooldown);
    event TokensClaimed(address indexed user, address indexed token, uint256 amount);
    event FaucetFunded(address indexed token, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "NeuraFaucet: NOT_OWNER");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function addToken(address token, uint256 amount, uint256 cooldown) external onlyOwner {
        require(token != address(0), "NeuraFaucet: ZERO_ADDRESS");
        require(amount > 0, "NeuraFaucet: ZERO_AMOUNT");
        require(cooldown > 0, "NeuraFaucet: ZERO_COOLDOWN");
        
        if (tokenAmounts[token] == 0) {
            supportedTokens.push(token);
        }
        
        tokenAmounts[token] = amount;
        tokenCooldowns[token] = cooldown;
        
        emit TokenAdded(token, amount, cooldown);
    }
    
    function claim(address token) external {
        require(tokenAmounts[token] > 0, "NeuraFaucet: TOKEN_NOT_SUPPORTED");
        require(
            block.timestamp >= lastClaim[msg.sender][token] + tokenCooldowns[token],
            "NeuraFaucet: COOLDOWN_NOT_PASSED"
        );
        
        uint256 amount = tokenAmounts[token];
        require(
            IERC20(token).balanceOf(address(this)) >= amount,
            "NeuraFaucet: INSUFFICIENT_BALANCE"
        );
        
        lastClaim[msg.sender][token] = block.timestamp;
        
        require(
            IERC20(token).transfer(msg.sender, amount),
            "NeuraFaucet: TRANSFER_FAILED"
        );
        
        emit TokensClaimed(msg.sender, token, amount);
    }
    
    function claimAll() external {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            if (
                block.timestamp >= lastClaim[msg.sender][token] + tokenCooldowns[token] &&
                IERC20(token).balanceOf(address(this)) >= tokenAmounts[token]
            ) {
                lastClaim[msg.sender][token] = block.timestamp;
                IERC20(token).transfer(msg.sender, tokenAmounts[token]);
                emit TokensClaimed(msg.sender, token, tokenAmounts[token]);
            }
        }
    }
    
    function canClaim(address user, address token) external view returns (bool) {
        return block.timestamp >= lastClaim[user][token] + tokenCooldowns[token];
    }
    
    function timeUntilClaim(address user, address token) external view returns (uint256) {
        uint256 nextClaimTime = lastClaim[user][token] + tokenCooldowns[token];
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
    
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
    
    function fundFaucet(address token, uint256 amount) external {
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "NeuraFaucet: TRANSFER_FAILED"
        );
        emit FaucetFunded(token, amount);
    }
    
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(
            IERC20(token).transfer(owner, amount),
            "NeuraFaucet: TRANSFER_FAILED"
        );
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "NeuraFaucet: ZERO_ADDRESS");
        owner = newOwner;
    }
    
    receive() external payable {}
    
    function withdrawANKR() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
