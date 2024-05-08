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

import {Test, console} from "forge-std/Test.sol";
import {PRNG} from "../src/PRNG.sol";

contract CounterTest is Test {
    PRNG testContract;
    address attestationCenter = makeAddr('attestationCenter');

    function setUp() public {
        testContract = new PRNG(attestationCenter);
    }

    function test_acl() public {
        vm.expectRevert("Not allowed");
        testContract.afterTaskSubmission(
            0,
            makeAddr('performer'),
            "123456",
            true,
            hex"",
            [uint(0), uint(0)],
            new uint[](0)
        );
    }

    function test_random() public {
        vm.prank(attestationCenter);
        testContract.afterTaskSubmission(
            0,
            makeAddr('performer'),
            "123456",
            true,
            hex"",
            [uint(0), uint(0)],
            new uint[](0)
        );

        uint expected = uint(keccak256(abi.encode(block.timestamp))) ^
            uint(keccak256(abi.encode(block.prevrandao))) ^
            uint(keccak256(bytes("123456")));

        assertEq(testContract.random(), expected);
    }
}
