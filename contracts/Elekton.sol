// SPDX-License-Identifier: MIT

pragma solidity ^0.6.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verifier.sol";

contract Elekton is Ownable, Verifier {

    event UserCreated (address, uint);
    event UserUpdated (address, uint);
    event BallotCreated (uint);
    event VoteAdded (uint indexed, uint);
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

    function createUser(uint _userId) external {
        require(_userId != 0, "user-id-cannot-be-0");
        require(users[_msgSender()] != _userId, "user-id-cannot-be-same");

        uint currentId = users[_msgSender()];

        users[_msgSender()] = _userId;

        if (currentId == 0) {
            emit UserCreated(_msgSender(), _userId);
        } else {
            emit UserUpdated(_msgSender(), _userId);
        }
    }

    function createBallot(uint _ballotId, uint _smtRoot, uint _startDate, uint _endDate) external {
        require(users[_msgSender()] != 0, "you-are-not-user");

        ballots[_ballotId].admin = _msgSender();
        ballots[_ballotId].smtRoot = _smtRoot;
        ballots[_ballotId].startDate = _startDate;
        ballots[_ballotId].endDate = _endDate;

        emit BallotCreated(_ballotId);
    }

    function vote(uint[2] calldata _a, uint[2][2] calldata _b, uint[2] calldata _c, uint[4] calldata _input) external {
        require(ballots[_input[2]].admin!= address(0), "wrong-ballot-id");
        require(block.timestamp > ballots[_input[2]].startDate, "invalid-vote-in-advance");
        require(block.timestamp < ballots[_input[2]].endDate, "invalid-late-vote");
        require(_input[0] == ballots[_input[2]].smtRoot, "wrong-smt-root");
        require(!voteNullifier[_input[3]], "voter-has-already-voted");
        require(verifyProof(_a, _b, _c, _input), "invalid-voting-proof");

        voteNullifier[_input[3]] = true;
        ballots[_input[2]].votes.push(_input[1]);

        emit VoteAdded(_input[2], _input[1]);
    }

    function publishPollKey(uint _ballotId, uint _pollKey) external {
        require(ballots[_ballotId].admin == _msgSender(), "you-are-not-ballot-user");
        require(block.timestamp > ballots[_ballotId].endDate, "voting-in-progress");

        ballots[_ballotId].pollKey = _pollKey;

        emit PollKeyPublished(_ballotId, _pollKey);
    }

}
