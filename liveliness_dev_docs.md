## Liveliness AVS
This document explains all developer details about the Liveliness AVS

### How it works:
The goal of the liveliness AVS is to facilitate a decentralized way for various kinds of node operators to prove their reliability. By signing up to the AVS, a performer will periodically healthcheck them, and the longer they are signed up in the AVS without getting penalized, the higher their reputation is.

The performer of the AVS each X amount of time: 
- chooses a random operator to healthcheck
- publishes a task to the network of the response it got (healthy/not healthy)
- operators vote on whether the performer executed the healthcheck correctly
- if operators approve of the task and the response was not healthy, chosen operater is penalized

The penalization is implemented through the usage of AVSLogic.

In this AVS, alongside needing to sign up to the AVS operators need to register to the LivelinessRegistry. The liveliness registry holds all endpoints that the operators of the network are commited to keep alive. These endpoints need to implement a specific API that responds with data which can be used to validate with high confidence the operator actually runs a working operator software

### How to run:
- Deploy AVS contracts with othentic-cli/ use existing set
- Fill in all env files (root-level env, TaskPerformer, AVSWebAPI)
- Deploy and connect LivelinessRegistry to AttestationCenter using `LivelinessRegistry.s.sol`
- Run `register_liveliness.sh` (this will register all operators from env to the liveliness registry)
- Run `docker-compose -f liveliness.compose.yml up --build`

### TODO:
- [ ] Use interfaces from othentic-contracts
- [ ] Choose X amount of operators to healthcheck, not just 1
- [ ] Handle certain complicated edge cases

todo tree:
```
└─ Liveliness-AVS
   ├─ AVS_Logic
   │  └─ src
   │     └─ LivelinessRegistry.sol
   │        ├─ line 14: TODO : should be upgradable, switch later
   │        └─ line 127: TODO : might make sense to add "isOperatorRegistered"
   ├─ AVS_WebAPI
   │  └─ validator.service.js
   │     ├─ line 12: TODO : handle case that operators change between healthcheck and validation
   │     └─ line 13: TODO : handle case format of IPFS file is invalid (punish performer)
   ├─ Common_Liveliness
   │  └─ db.service.js
   │     └─ line 31: TODO : decide if to incorporate blockhash or is it too much for an example
   └─ Task_Performer
      └─ healthcheck.service.js
         └─ line 28: TODO : add retries
```