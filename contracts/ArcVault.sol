// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcVault
 * @dev Vault/Staking para Arc Network
 * Permite stake de tokens ARC com recompensas
 */
contract ArcVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Token de staking
    IERC20 public stakingToken;
    
    // Token de recompensa (pode ser o mesmo)
    IERC20 public rewardToken;
    
    // Informações de stake por usuário
    struct StakeInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 stakedAt;
        uint256 lastClaimAt;
    }
    
    mapping(address => StakeInfo) public stakes;
    
    // Configurações do vault
    uint256 public totalStaked;
    uint256 public rewardPerSecond;
    uint256 public accRewardPerShare;
    uint256 public lastRewardTime;
    
    // Período mínimo de stake (em segundos)
    uint256 public minStakePeriod = 7 days;
    
    // Taxa de saída antecipada (em basis points, 500 = 5%)
    uint256 public earlyWithdrawFee = 500;
    
    // Precisão para cálculos
    uint256 private constant PRECISION = 1e12;
    
    // Eventos
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 fee);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event MinStakePeriodUpdated(uint256 newPeriod);
    event EarlyWithdrawFeeUpdated(uint256 newFee);
    
    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev Atualizar recompensas acumuladas
     */
    function updatePool() public {
        if (block.timestamp <= lastRewardTime) {
            return;
        }
        
        if (totalStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - lastRewardTime;
        uint256 reward = timeElapsed * rewardPerSecond;
        
        accRewardPerShare += (reward * PRECISION) / totalStaked;
        lastRewardTime = block.timestamp;
    }
    
    /**
     * @dev Fazer stake de tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        updatePool();
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // Se já tem stake, calcular recompensas pendentes
        if (userStake.amount > 0) {
            uint256 pending = (userStake.amount * accRewardPerShare / PRECISION) - userStake.rewardDebt;
            if (pending > 0) {
                _safeRewardTransfer(msg.sender, pending);
                emit RewardClaimed(msg.sender, pending);
            }
        }
        
        // Transferir tokens para o vault
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Atualizar stake do usuário
        userStake.amount += amount;
        userStake.rewardDebt = userStake.amount * accRewardPerShare / PRECISION;
        
        if (userStake.stakedAt == 0) {
            userStake.stakedAt = block.timestamp;
        }
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Retirar tokens do stake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(amount > 0, "Amount must be greater than 0");
        
        updatePool();
        
        // Calcular recompensas pendentes
        uint256 pending = (userStake.amount * accRewardPerShare / PRECISION) - userStake.rewardDebt;
        
        if (pending > 0) {
            _safeRewardTransfer(msg.sender, pending);
            emit RewardClaimed(msg.sender, pending);
        }
        
        // Calcular taxa de saída antecipada
        uint256 fee = 0;
        if (block.timestamp < userStake.stakedAt + minStakePeriod) {
            fee = (amount * earlyWithdrawFee) / 10000;
        }
        
        uint256 amountAfterFee = amount - fee;
        
        // Atualizar stake do usuário
        userStake.amount -= amount;
        userStake.rewardDebt = userStake.amount * accRewardPerShare / PRECISION;
        
        if (userStake.amount == 0) {
            userStake.stakedAt = 0;
        }
        
        totalStaked -= amount;
        
        // Transferir tokens
        stakingToken.safeTransfer(msg.sender, amountAfterFee);
        
        // Taxa vai para o owner
        if (fee > 0) {
            stakingToken.safeTransfer(owner(), fee);
        }
        
        emit Unstaked(msg.sender, amount, fee);
    }
    
    /**
     * @dev Reivindicar recompensas sem fazer unstake
     */
    function claimRewards() external nonReentrant {
        updatePool();
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        require(userStake.amount > 0, "No stake found");
        
        uint256 pending = (userStake.amount * accRewardPerShare / PRECISION) - userStake.rewardDebt;
        
        require(pending > 0, "No rewards to claim");
        
        userStake.rewardDebt = userStake.amount * accRewardPerShare / PRECISION;
        userStake.lastClaimAt = block.timestamp;
        
        _safeRewardTransfer(msg.sender, pending);
        
        emit RewardClaimed(msg.sender, pending);
    }
    
    /**
     * @dev Ver recompensas pendentes
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 _accRewardPerShare = accRewardPerShare;
        
        if (block.timestamp > lastRewardTime && totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastRewardTime;
            uint256 reward = timeElapsed * rewardPerSecond;
            _accRewardPerShare += (reward * PRECISION) / totalStaked;
        }
        
        return (userStake.amount * _accRewardPerShare / PRECISION) - userStake.rewardDebt;
    }
    
    /**
     * @dev Calcular APY atual
     */
    function currentAPY() external view returns (uint256) {
        if (totalStaked == 0) {
            return 0;
        }
        
        uint256 yearlyRewards = rewardPerSecond * 365 days;
        return (yearlyRewards * 10000) / totalStaked; // Em basis points
    }
    
    /**
     * @dev Transferência segura de recompensas
     */
    function _safeRewardTransfer(address to, uint256 amount) internal {
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        
        // Se for o mesmo token, subtrair o staked
        if (address(rewardToken) == address(stakingToken)) {
            rewardBalance = rewardBalance > totalStaked ? rewardBalance - totalStaked : 0;
        }
        
        if (amount > rewardBalance) {
            rewardToken.safeTransfer(to, rewardBalance);
        } else {
            rewardToken.safeTransfer(to, amount);
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Definir taxa de recompensa por segundo
     */
    function setRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
        updatePool();
        rewardPerSecond = _rewardPerSecond;
        emit RewardRateUpdated(_rewardPerSecond);
    }
    
    /**
     * @dev Definir período mínimo de stake
     */
    function setMinStakePeriod(uint256 _minStakePeriod) external onlyOwner {
        minStakePeriod = _minStakePeriod;
        emit MinStakePeriodUpdated(_minStakePeriod);
    }
    
    /**
     * @dev Definir taxa de saída antecipada
     */
    function setEarlyWithdrawFee(uint256 _fee) external onlyOwner {
        require(_fee <= 2000, "Fee too high"); // Max 20%
        earlyWithdrawFee = _fee;
        emit EarlyWithdrawFeeUpdated(_fee);
    }
    
    /**
     * @dev Depositar tokens de recompensa
     */
    function depositRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }
    
    /**
     * @dev Retirar tokens de recompensa excedentes
     */
    function withdrawExcessRewards(uint256 amount) external onlyOwner {
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        
        if (address(rewardToken) == address(stakingToken)) {
            require(rewardBalance - amount >= totalStaked, "Cannot withdraw staked tokens");
        }
        
        rewardToken.safeTransfer(owner(), amount);
    }
    
    /**
     * @dev Emergência: pausar e retirar todos os fundos
     */
    function emergencyWithdraw() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        
        uint256 amount = userStake.amount;
        require(amount > 0, "No stake found");
        
        userStake.amount = 0;
        userStake.rewardDebt = 0;
        userStake.stakedAt = 0;
        
        totalStaked -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, 0);
    }
}
