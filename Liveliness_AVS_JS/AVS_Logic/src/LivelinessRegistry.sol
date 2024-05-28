// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

// import { IAvsGovernance } from "@othentic/contracts/src/NetworkManagement/L1/interfaces/IAvsGovernance.sol";
// using local interface until added functions are merged
import { IAvsGovernance } from "src/interfaces/IAvsGovernance.sol";
import { ILivelinessRegistry } from "src/interfaces/ILivelinessRegistry.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// contract should be owned by AvsGovernance
// TODO: should be upgradable, switch later 
contract LivelinessRegistry is ILivelinessRegistry, Ownable {
    // can operator indicies change? (e.g. unregistration from AVS)
    struct Registration {
        uint256 operatorIndex;
        uint256 blockNumber;
        string endpoint;
    }

    uint256 constant private PENALTY_COST = 1000;

    mapping(address => Registration) public registrations;
    mapping(address => uint256) private penalties;
    IAvsGovernance public avsGovernance;

    constructor(IAvsGovernance _avsGovernance) Ownable(msg.sender) {
        avsGovernance = _avsGovernance;
    }

    modifier registeredOperator(address _operator) {
        Registration memory registration = registrations[_operator];
        if (registration.operatorIndex == 0) {
            revert OperatorNotRegistered();
        }

        _;
    }

    modifier onlyAvsOperator() {
        uint256 operatorIndex = avsGovernance.operatorsIndexs(msg.sender);
        if (operatorIndex == 0) {
            revert OperatorNotInAVS();
        }
        _;
    }

    // need to put more thought into how liveliness scores are calculated.
    // for now = blocksSinceRegistration - C * penalites, where C is a constant representing the price of penalites
    // potential ideas is to incorporate the stake of the operator in the calculation and also how recent were the penalites
    function getLivelinessScore(address _operator) external view registeredOperator(_operator) returns (uint256) {
        Registration memory registration = registrations[_operator];
        uint256 blocksSinceRegistration = block.number - registration.blockNumber;
        uint256 penaltyBlocks = penalties[_operator] * PENALTY_COST;

        if (penaltyBlocks > blocksSinceRegistration) {
            return 0;
        } else {
            return blocksSinceRegistration - penaltyBlocks;
        }
    }

    function register(string memory _endpoint) external onlyAvsOperator() {
        uint256 operatorIndex = avsGovernance.operatorsIndexs(msg.sender);
        registrations[msg.sender] = Registration(operatorIndex, block.number, _endpoint);

        emit OperatorRegistered(msg.sender, _endpoint);
    }

    function penalizeOperator(address _operator) external onlyOwner() {
        penalties[_operator] += 1;
        emit OperatorPenalized(_operator);
    }

    // TODO: add unregistration function

    error OperatorNotInAVS();
    error OperatorNotRegistered();
}