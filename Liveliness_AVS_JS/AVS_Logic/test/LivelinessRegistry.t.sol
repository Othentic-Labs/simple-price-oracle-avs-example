// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { Test, console } from "forge-std/Test.sol";
import { CommonBase } from "forge-std/Base.sol";
// comment in once interface is updated in main
// import { IAttestationCenter } from "@othentic/contracts/src/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import { IAttestationCenter } from "src/interfaces/IAttestationCenter.sol";
import { ExposedLivelinessRegistry } from "test/exposes/ExposedLivelinessRegistry.sol";

contract Shared is CommonBase {
    event OperatorRegistered(address operator, string endpoint);
    event OperatorUnregistered(address operator);
    event OperatorPenalized(address operator);

    error OperatorInAVS();
    error OperatorNotInAVS();
    error OperatorNotRegistered();

    error OwnableUnauthorizedAccount(address account);

    uint256 constant internal PENALTY_COST = 1000;

    address constant internal OWNER = address(1);
    IAttestationCenter constant internal ATTESTATION_CENTER = IAttestationCenter(address(2));
    address constant internal OPERATOR = address(3);
    address constant internal OUTSIDER = address(9999);
    uint256 constant internal OPERATOR_INDEX = 1;
    uint256 constant internal BLOCK_NUMBER = 10;

    ExposedLivelinessRegistry internal registry;

    function _setUp() internal {
        vm.prank(OWNER);
        registry = new ExposedLivelinessRegistry(ATTESTATION_CENTER);
    }
}

contract Constructor is Test, Shared {
    function setUp() public {
        _setUp();
    }

    function test_constructor() public view {
        assertEq(registry.owner(), OWNER);
    }

    function test_attestationCenter() public view {
        assertEq(address(registry.attestationCenter()), address(ATTESTATION_CENTER));
    }
}

contract Register is Test, Shared {
    function setUp() public {
        _setUp();
    }

    function test_simpleCase_operatorRegistered() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.expectEmit(address(registry));
        emit OperatorRegistered(OPERATOR, "endpoint");
        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        (uint256 operatorIndex, uint256 blockNumber, string memory endpoint) = registry.registrations(OPERATOR);
        assertEq(operatorIndex, OPERATOR_INDEX);
        assertEq(blockNumber, BLOCK_NUMBER);
        assertEq(endpoint, "endpoint");
    }

    function test_unauthorizedOperator_revert() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(0)
        );

        vm.expectRevert(OperatorNotInAVS.selector);
        vm.prank(OPERATOR);
        registry.register("endpoint");
    }
}

contract Unregister is Test, Shared {
    function setUp() public {
        _setUp();
    }

    function test_simpleCase_operatorUnregistered() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(0)
        );

        vm.expectEmit(address(registry));
        emit OperatorUnregistered(OPERATOR);
        vm.prank(OPERATOR);
        registry.unregister();

        (uint256 operatorIndex, uint256 blockNumber, string memory endpoint) = registry.registrations(OPERATOR);
        assertEq(operatorIndex, 0);
        assertEq(blockNumber, 0);
        assertEq(endpoint, "");
    }

    function test_unauthorizedOperator_revert() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(0)
        );

        vm.expectRevert(OperatorNotRegistered.selector);
        vm.prank(OPERATOR);
        registry.unregister();
    }

    function test_stillRegisteredInAVS_revert() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        vm.expectRevert(OperatorInAVS.selector);
        vm.prank(OPERATOR);
        registry.unregister();    
    }
}

contract PenalizeOperator is Test, Shared {
    function setUp() public {
        _setUp();
    }

    function test_simpleCase_operatorPenalized() public {
        // register operator
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        // penalize operator
        vm.expectEmit(address(registry));
        emit OperatorPenalized(OPERATOR);
        vm.prank(OWNER);
        registry.penalizeOperator(OPERATOR);

        assertEq(registry.getPenalties(OPERATOR), 1);
    }

    function test_unauthorizedOwner_revert() public {
        vm.expectRevert(abi.encodeWithSelector(OwnableUnauthorizedAccount.selector, OUTSIDER));
        vm.prank(OUTSIDER);
        registry.penalizeOperator(OPERATOR);
    }
}

contract GetLivelinessScore is Test, Shared {
    function setUp() public {
        _setUp();
    }

    function test_simpleCase_returnsScore() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        vm.roll(BLOCK_NUMBER + 1234);
        uint256 livelinessScore = registry.getLivelinessScore(OPERATOR);
        assertEq(livelinessScore, 1234);
    }

    function test_twoPenalties_returnsScore() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        vm.prank(OWNER);
        registry.penalizeOperator(OPERATOR);
        vm.prank(OWNER);
        registry.penalizeOperator(OPERATOR);

        vm.roll(BLOCK_NUMBER + 20_000);
        uint256 livelinessScore = registry.getLivelinessScore(OPERATOR);
        assertEq(livelinessScore, 20_000 - 2 * PENALTY_COST);  
    }

    function test_penaltyGreaterThanBlocksSinceRegistration_returnsZero() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(OPERATOR_INDEX)
        );

        vm.roll(BLOCK_NUMBER);
        vm.prank(OPERATOR);
        registry.register("endpoint");

        vm.prank(OWNER);
        registry.penalizeOperator(OPERATOR);

        vm.roll(BLOCK_NUMBER + 100);
        uint256 livelinessScore = registry.getLivelinessScore(OPERATOR);
        assertEq(livelinessScore, 0);
    }

    function test_operatorNotRegistered_revert() public {
        vm.mockCall(
            address(ATTESTATION_CENTER), 
            abi.encodeWithSelector(ATTESTATION_CENTER.operatorsIdsByAddress.selector, OPERATOR),
            abi.encode(0)
        );

        vm.expectRevert(OperatorNotRegistered.selector);
        registry.getLivelinessScore(OUTSIDER);
    }
}