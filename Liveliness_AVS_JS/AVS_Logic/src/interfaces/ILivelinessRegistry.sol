// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

interface ILivelinessRegistry {
    event OperatorRegistered(address operator, string endpoint);
    event OperatorUnregistered(address operator);
    event OperatorPenalized(address operator);

    function registrations(address operator) external view returns (uint256 operatorIndex, uint256 blockNumber, string memory endpoint);
    function getLivelinessScore(address operator) external view returns (uint256);
    function register(string memory endpoint) external;

    error OperatorInAVS();
    error OperatorNotInAVS();
    error OperatorNotRegistered();
    error Unauthorized();
}