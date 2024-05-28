// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

import { IAvsGovernance } from "@othentic/contracts/src/NetworkManagement/L1/interfaces/IAvsGovernance.sol";
import { LivelinessRegistry } from "src/LivelinessRegistry.sol";

contract ExposedLivelinessRegistry is LivelinessRegistry {
    constructor(IAvsGovernance _avsGovernance) LivelinessRegistry(_avsGovernance) {}

    function getPenalties(address _operator) external view returns (uint256) {
        return penalties[_operator];
    }
}