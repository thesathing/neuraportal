// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

contract NeuraToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    address public owner;
    bool public mintable;
    bool public burnable;
    bool public pausable;
    bool public paused;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "NeuraToken: NOT_OWNER");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused || !pausable, "NeuraToken: PAUSED");
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        bool _mintable,
        bool _burnable,
        bool _pausable
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10 ** _decimals);
        mintable = _mintable;
        burnable = _burnable;
        pausable = _pausable;
        owner = msg.sender;
        
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) external whenNotPaused returns (bool) {
        require(to != address(0), "NeuraToken: ZERO_ADDRESS");
        require(balanceOf[msg.sender] >= value, "NeuraToken: INSUFFICIENT_BALANCE");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external whenNotPaused returns (bool) {
        require(to != address(0), "NeuraToken: ZERO_ADDRESS");
        require(balanceOf[from] >= value, "NeuraToken: INSUFFICIENT_BALANCE");
        require(allowance[from][msg.sender] >= value, "NeuraToken: INSUFFICIENT_ALLOWANCE");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= value;
        }
        
        emit Transfer(from, to, value);
        return true;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(mintable, "NeuraToken: NOT_MINTABLE");
        require(to != address(0), "NeuraToken: ZERO_ADDRESS");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }
    
    function burn(uint256 amount) external {
        require(burnable, "NeuraToken: NOT_BURNABLE");
        require(balanceOf[msg.sender] >= amount, "NeuraToken: INSUFFICIENT_BALANCE");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function pause() external onlyOwner {
        require(pausable, "NeuraToken: NOT_PAUSABLE");
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        require(pausable, "NeuraToken: NOT_PAUSABLE");
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "NeuraToken: ZERO_ADDRESS");
        owner = newOwner;
    }
}
