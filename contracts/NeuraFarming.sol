// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

contract NeuraFarming {
    struct PoolInfo {
        IERC20 lpToken;
        IERC20 rewardToken;
        uint256 allocPoint;
        uint256 lastRewardTime;
        uint256 accRewardPerShare;
        uint256 totalStaked;
        uint256 rewardPerSecond;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
    }
    
    address public owner;
    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    
    uint256 public totalAllocPoint;
    
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address lpToken, address rewardToken, uint256 allocPoint);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "NeuraFarming: NOT_OWNER");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
    
    function addPool(
        IERC20 _lpToken,
        IERC20 _rewardToken,
        uint256 _allocPoint,
        uint256 _rewardPerSecond,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime < _endTime, "NeuraFarming: INVALID_TIME_RANGE");
        require(address(_lpToken) != address(0), "NeuraFarming: ZERO_LP_TOKEN");
        require(address(_rewardToken) != address(0), "NeuraFarming: ZERO_REWARD_TOKEN");
        
        totalAllocPoint += _allocPoint;
        
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            rewardToken: _rewardToken,
            allocPoint: _allocPoint,
            lastRewardTime: _startTime,
            accRewardPerShare: 0,
            totalStaked: 0,
            rewardPerSecond: _rewardPerSecond,
            startTime: _startTime,
            endTime: _endTime
        }));
        
        emit PoolAdded(poolInfo.length - 1, address(_lpToken), address(_rewardToken), _allocPoint);
    }
    
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        
        if (block.timestamp <= pool.lastRewardTime) {
            return;
        }
        
        if (pool.totalStaked == 0) {
            pool.lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 endTime = block.timestamp > pool.endTime ? pool.endTime : block.timestamp;
        if (endTime <= pool.lastRewardTime) {
            return;
        }
        
        uint256 timeElapsed = endTime - pool.lastRewardTime;
        uint256 reward = timeElapsed * pool.rewardPerSecond * pool.allocPoint / totalAllocPoint;
        
        pool.accRewardPerShare += (reward * 1e12) / pool.totalStaked;
        pool.lastRewardTime = block.timestamp;
    }
    
    function pendingReward(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        
        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.timestamp > pool.lastRewardTime && pool.totalStaked != 0) {
            uint256 endTime = block.timestamp > pool.endTime ? pool.endTime : block.timestamp;
            if (endTime > pool.lastRewardTime) {
                uint256 timeElapsed = endTime - pool.lastRewardTime;
                uint256 reward = timeElapsed * pool.rewardPerSecond * pool.allocPoint / totalAllocPoint;
                accRewardPerShare += (reward * 1e12) / pool.totalStaked;
            }
        }
        
        return user.pendingRewards + (user.amount * accRewardPerShare / 1e12) - user.rewardDebt;
    }
    
    function deposit(uint256 _pid, uint256 _amount) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(block.timestamp >= pool.startTime, "NeuraFarming: POOL_NOT_STARTED");
        require(block.timestamp < pool.endTime, "NeuraFarming: POOL_ENDED");
        
        updatePool(_pid);
        
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
            if (pending > 0) {
                user.pendingRewards += pending;
            }
        }
        
        if (_amount > 0) {
            pool.lpToken.transferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
            pool.totalStaked += _amount;
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        emit Deposit(msg.sender, _pid, _amount);
    }
    
    function withdraw(uint256 _pid, uint256 _amount) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        require(user.amount >= _amount, "NeuraFarming: INSUFFICIENT_BALANCE");
        
        updatePool(_pid);
        
        uint256 pending = (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
        if (pending > 0) {
            user.pendingRewards += pending;
        }
        
        if (_amount > 0) {
            user.amount -= _amount;
            pool.totalStaked -= _amount;
            pool.lpToken.transfer(msg.sender, _amount);
        }
        
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        emit Withdraw(msg.sender, _pid, _amount);
    }
    
    function harvest(uint256 _pid) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        updatePool(_pid);
        
        uint256 pending = user.pendingRewards + (user.amount * pool.accRewardPerShare / 1e12) - user.rewardDebt;
        
        require(pending > 0, "NeuraFarming: NO_PENDING_REWARDS");
        
        user.pendingRewards = 0;
        user.rewardDebt = user.amount * pool.accRewardPerShare / 1e12;
        
        pool.rewardToken.transfer(msg.sender, pending);
        
        emit Harvest(msg.sender, _pid, pending);
    }
    
    function emergencyWithdraw(uint256 _pid) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
        pool.totalStaked -= amount;
        
        pool.lpToken.transfer(msg.sender, amount);
        
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }
    
    function setAllocPoint(uint256 _pid, uint256 _allocPoint) external onlyOwner {
        totalAllocPoint = totalAllocPoint - poolInfo[_pid].allocPoint + _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
    }
    
    function fundRewards(uint256 _pid, uint256 _amount) external {
        PoolInfo storage pool = poolInfo[_pid];
        pool.rewardToken.transferFrom(msg.sender, address(this), _amount);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "NeuraFarming: ZERO_ADDRESS");
        owner = newOwner;
    }
}
