// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

// comment in once interface is updated in main
// import { IAttestationCenter } from "@othentic/contracts/src/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import { IAttestationCenter } from "src/interfaces/IAttestationCenter.sol";
import { LivelinessRegistry } from "src/LivelinessRegistry.sol";

contract ExposedLivelinessRegistry is LivelinessRegistry {
    constructor(IAttestationCenter _attestationCenter) LivelinessRegistry(_attestationCenter) {}

    function getPenalties(address _operator) external view returns (uint256) {
        return penalties[_operator];
    }
}