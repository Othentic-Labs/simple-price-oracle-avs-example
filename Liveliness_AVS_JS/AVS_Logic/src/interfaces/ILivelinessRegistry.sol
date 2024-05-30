// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

interface ILivelinessRegistry {
    event OperatorRegistered(address operator, string endpoint);
    event OperatorUnregistered(address operator);
    event OperatorPenalized(address operator);

    function getLivelinessScore(address operator) external view returns (uint256);
    function register(string memory endpoint) external;

    error OperatorInAVS();
    error OperatorNotInAVS();
    error OperatorNotRegistered();
    error Unauthorized();
}