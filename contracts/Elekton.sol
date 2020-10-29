// SPDX-License-Identifier: MIT

pragma solidity ^0.6.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verifier.sol";

contract Elekton is Ownable, Verifier {

    event UserCreated (address, uint);
    event BallotCreated (uint);
    event VoteAdded (uint, uint);
    event PollKeyPublished (uint, uint);

    struct Ballot {
        address admin;
        uint smtRoot;
        uint startDate;
        uint endDate;
        uint[] votes;
        uint pollKey;
    }

    mapping(address => uint) public users;
    mapping(uint => Ballot) public ballots;
    mapping(uint => bool) voteNullifier;

    function createUser(uint _id) external {
        users[_msgSender()] = _id;

        emit UserCreated(_msgSender(), _id);
    }

    function createBallot(uint _id, uint _smtRoot, uint _startDate, uint _endDate) external {
        require(users[_msgSender()] != 0, "you-are-not-user");

        ballots[_id].admin = _msgSender();
        ballots[_id].smtRoot = _smtRoot;
        ballots[_id].startDate = _startDate;
        ballots[_id].endDate = _endDate;

        emit BallotCreated(_id);
    }

    function vote(uint[2] calldata a, uint[2][2] calldata b, uint[2] calldata c, uint[4] calldata input) external {
        require(ballots[input[2]].admin!= address(0), "wrong-ballot-id");
        require(now > ballots[input[2]].startDate, "invalid-vote-in-advance");
        require(now < ballots[input[2]].endDate, "invalid-late-vote");
        require(input[0] == ballots[input[2]].smtRoot, "wrong-smt-root");
        require(!voteNullifier[input[3]], "voter-has-already-voted");
        require(verifyProof(a, b, c, input), "invalid-voting-proof");

        voteNullifier[input[3]] = true;
        ballots[input[2]].votes.push(input[1]);

        emit VoteAdded(input[2], input[1]);
    }

    function publishPollKey(uint _ballotId, uint _pollKey) external {
        require(ballots[_ballotId].admin == _msgSender(), "you-are-not-ballot-user");
        require(now > ballots[_ballotId].endDate, "voting-in-progress");

        ballots[_ballotId].pollKey = _pollKey;

        emit PollKeyPublished(_ballotId, _pollKey);
    }
}
