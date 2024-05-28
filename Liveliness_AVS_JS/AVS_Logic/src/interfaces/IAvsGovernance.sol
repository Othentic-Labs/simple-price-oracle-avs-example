// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

/*______     __      __                              __      __ 
 /      \   /  |    /  |                            /  |    /  |
/$$$$$$  | _$$ |_   $$ |____    ______   _______   _$$ |_   $$/   _______ 
$$ |  $$ |/ $$   |  $$      \  /      \ /       \ / $$   |  /  | /       |
$$ |  $$ |$$$$$$/   $$$$$$$  |/$$$$$$  |$$$$$$$  |$$$$$$/   $$ |/$$$$$$$/ 
$$ |  $$ |  $$ | __ $$ |  $$ |$$    $$ |$$ |  $$ |  $$ | __ $$ |$$ |
$$ \__$$ |  $$ |/  |$$ |  $$ |$$$$$$$$/ $$ |  $$ |  $$ |/  |$$ |$$ \_____ 
$$    $$/   $$  $$/ $$ |  $$ |$$       |$$ |  $$ |  $$  $$/ $$ |$$       |
 $$$$$$/     $$$$/  $$/   $$/  $$$$$$$/ $$/   $$/    $$$$/  $$/  $$$$$$$/
*/


struct Operator {
    uint256[4] blsKey;
    uint256 numOfShares;
    bool isWhitelisted;
    bool isActive;
}
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
interface IAvsGovernance {

    // Owner events
    event SetToken(address token);
    event SetSlashingRate(uint24 rate);

    event OperatorRegistered(uint index, address indexed operator, uint256[4] blsKey);
    event OperatorDeactivated(address operator);
    error Unauthorized(string message);
    error InvalidSignature(address operator);

    function operatorsIndexs(address) external view returns (uint256);
    function getIsAllowlisted() external view returns (bool);
    function registerAsOperator(uint256[4] calldata _pubkey) external;
    function registerAsAllowedOperator(uint256[4] calldata _pubkey, bytes calldata _token) external;
    function depositIntoStrategy(uint256 amount, uint256 expiry, bytes memory signature) external;
    function recordFirstStakeUpdate(uint32 _serveUntilBlock) external;
    function freezeOperator(address _operator) external;
    function depositRewardsWithApprove(uint256 _amount) external;
    function withdrawRewards(address _operator, uint256 _lastPayedTask, uint256 _feeToClaim) external;
    function transferAvsGovernance(address _newAvsGovernanceMultisig) external;
}