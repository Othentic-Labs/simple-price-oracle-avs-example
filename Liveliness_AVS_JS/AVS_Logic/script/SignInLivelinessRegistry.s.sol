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

import {Script, console} from "forge-std/Script.sol";
import { IAttestationCenter } from "@othentic/contracts/src/NetworkManagement/L2/interfaces/IAttestationCenter.sol";
import { ILivelinessRegistry } from 'src/interfaces/ILivelinessRegistry.sol';

// How to:
// Either `source ../../.env` or replace variables in command.
// forge script SignInLivelinessRegistry --rpc-url $L2_RPC --private-key $PRIVATE_KEY
// --broadcast -vvvv --sig="run(address,string)" $ATTESTATION_CENTER_ADDRESS $ENDPOINT
contract SignInLivelinessRegistry is Script {
    function setUp() public {}

    function run(address attestationCenter, string memory endpoint) public {
        vm.startBroadcast();
        
        ILivelinessRegistry livelinessRegistry = ILivelinessRegistry(address(IAttestationCenter(attestationCenter).avsLogic()));
        livelinessRegistry.register(endpoint);
    }
}
