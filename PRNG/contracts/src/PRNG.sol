// SPDX-License-Identifier: UNLICENSED
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
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */

import './IAvsLogic.sol';

contract PRNG is IAvsLogic {
    uint256 public random;
    address public attestationCenter;

    constructor (address _attestationCenter) {
        attestationCenter = _attestationCenter;
    }

    function afterTaskSubmission(uint16 /* _taskDefinitionId */, address /* _performerAddr */, string calldata _proofOfTask, bool /* _isApproved */, bytes calldata /* _tpSignature */, uint256[2] calldata /* _taSignature */, uint256[] calldata /* _operatorIds */) external {
        require(msg.sender == attestationCenter, "Not allowed");

        random = uint(keccak256(abi.encode(block.timestamp))) ^
            uint(keccak256(abi.encode(block.prevrandao))) ^
            uint(keccak256(bytes(_proofOfTask)));
    }

    function beforeTaskSubmission(uint16 _taskDefinitionId, address _performerAddr, string calldata _proofOfTask, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _operatorIds) external {
        // No implementation
    }
}
