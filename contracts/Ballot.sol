// SPDX-License-Identifier: MIT

pragma solidity ^0.6.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verifier.sol";

contract Ballot is Ownable, Verifier {

    event VoteAdded (uint);
    event PollKeySet (bytes32);

    bytes32 public name;
    bytes32 public question;
    bytes32[] public proposals;
    bytes32[] public voters;
    bytes32 public encryptionKey;

    uint public smtRoot;
    uint public startDate;
    uint public endDate;
    uint[] public votes;
    bytes32 public pollKey;

    mapping(uint => bool) nullifier;

    constructor (bytes32 _name, bytes32 _question, bytes32[] memory _proposals, bytes32[] memory _voters, uint _smtRoot, uint _startDate, uint _endDate, bytes32 _encryptionKey, address _owner) public {
        name = _name;
        question = _question;
        proposals = _proposals;
        encryptionKey = _encryptionKey;
        voters = _voters;
        smtRoot = _smtRoot;
        startDate = _startDate;
        endDate = _endDate;

        transferOwnership(_owner);
    }

    function vote(uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[4] calldata input) external {
        require(now > startDate, "invalid-vote-in-advance");
        require(now < endDate, "invalid-late-vote");
        require(address(input[2]) == address(this), "wrong-ballot-address");
        require(input[0] == smtRoot, "wrong-smt-root");
        require(!nullifier[input[3]], "voter-has-already-voted");
        require(verifyProof(a, b, c, input), "invalid-voting-proof");

        nullifier[input[3]] = true;
        votes.push(input[1]);
    }

    function setPollKey(bytes32 _pollKey) external onlyOwner {
        require(now > endDate, "voting-in-progress");

        pollKey = _pollKey;
    }

}
