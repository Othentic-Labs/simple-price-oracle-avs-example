// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

interface ILivelinessRegistry {
    event OperatorRegistered(address operator, string endpoint);
    event OperatorPenalized(address operator);

    function getLivelinessScore(address operator) external view returns (uint256);
    function register(string memory endpoint) external;
    function penalizeOperator(address operator) external;
}