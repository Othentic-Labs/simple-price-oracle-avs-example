// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { Test, console } from "forge-std/Test.sol";
// import { IAvsGovernance } from "@othentic/contracts/src/NetworkManagement/L1/interfaces/IAvsGovernance.sol";
// using local interface until added functions are merged
import { IAvsGovernance } from "src/interfaces/IAvsGovernance.sol";
import { LivelinessRegistry } from "src/LivelinessRegistry.sol";

contract Constructor is Test {
    address constant private OWNER = address(1);
    IAvsGovernance constant private AVS_GOVERNANCE = IAvsGovernance(address(2));

    LivelinessRegistry public registry;

    function setUp() public {
        vm.prank(OWNER);
        registry = new LivelinessRegistry(AVS_GOVERNANCE);
    }

    function test_Constructor() public view {
        assertEq(registry.owner(), OWNER);
    }

    function test_AvsGovernance() public view {
        assertEq(address(registry.avsGovernance()), address(AVS_GOVERNANCE));
    }
}