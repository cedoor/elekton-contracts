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
        require(_userId != 0, "E000"); // User id must be different from 0.
        require(users[_msgSender()] != _userId, "E001"); // New user id must be different from current id.

        uint currentId = users[_msgSender()];

        users[_msgSender()] = _userId;

        if (currentId == 0) {
            emit UserCreated(_msgSender(), _userId);
        } else {
            emit UserUpdated(_msgSender(), _userId);
        }
    }

    function createBallot(uint _ballotId, uint _smtRoot, uint _startDate, uint _endDate) external {
        require(users[_msgSender()] != 0, "E100"); // User must exist.
        require(_startDate > block.timestamp, "E101"); // Start date cannot be in the past.
        require(_startDate + 10 seconds <= _endDate, "E102"); // Time interval is too short.

        ballots[_ballotId].admin = _msgSender();
        ballots[_ballotId].smtRoot = _smtRoot;
        ballots[_ballotId].startDate = _startDate;
        ballots[_ballotId].endDate = _endDate;

        emit BallotCreated(_ballotId);
    }

    function vote(uint[2] calldata _a, uint[2][2] calldata _b, uint[2] calldata _c, uint[4] calldata _input) external {
        require(ballots[_input[2]].admin!= address(0), "E200"); // Ballot id is wrong.
        require(block.timestamp > ballots[_input[2]].startDate, "E201"); // Invalid vote in advance.
        require(block.timestamp < ballots[_input[2]].endDate, "E202"); // Invalid late vote.
        require(_input[0] == ballots[_input[2]].smtRoot, "E203"); // SMT root is wrong.
        require(!voteNullifier[_input[3]], "E204"); // User has already voted.
        require(verifyProof(_a, _b, _c, _input), "E205]"); // Voting proof is wrong.

        voteNullifier[_input[3]] = true;
        ballots[_input[2]].votes.push(_input[1]);

        emit VoteAdded(_input[2], _input[1]);
    }

    function publishPollKey(uint _ballotId, uint _pollKey) external {
        require(ballots[_ballotId].admin == _msgSender(), "E103"); // User is not the ballot admin.
        require(block.timestamp > ballots[_ballotId].endDate, "E104"); // Poll key can be published after ballot end date.

        ballots[_ballotId].pollKey = _pollKey;

        emit PollKeyPublished(_ballotId, _pollKey);
    }

}
