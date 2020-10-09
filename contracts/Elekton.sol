// SPDX-License-Identifier: MIT

pragma solidity ^0.6.11;
// pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@nomiclabs/buidler/console.sol";
import "./Verifier.sol";
import "./Ballot.sol";

contract Elekton is Ownable {

    event AdminCreated (address);
    event VoterCreated (bytes32);
    event BallotCreated (Ballot);

    struct Voter {
        bytes32 publicKey;
        bytes32 username;
        bytes32 name;
        bytes32 surname;
    }

    mapping(address => bool) public isAdmin;
    mapping(bytes32 => bool) public isUsername;

    Voter[] public voters;
    Ballot[] public ballots;

    function createAdmin() external {
        isAdmin[_msgSender()] = true;
    }

    function createVoter(bytes32 _publicKey, bytes32 _username, bytes32 _name, bytes32 _surname) external {
        require(!isUsername[_username], "username-already-exists");

        Voter memory voter = Voter( _publicKey, _username, _name, _surname);

        voters.push(voter);
    }

    function createBallot(
        bytes32 _name,
        bytes32 _question,
        bytes32[] calldata _proposals,
        bytes32[] calldata _voters,
        uint _smtRoot,
        uint _startDate,
        uint _endDate,
        bytes32 _encryptionKey
    ) external {
        require(isAdmin[_msgSender()], "you-are-not-admin");

        ballots.push(new Ballot(_name, _question, _proposals, _voters, _smtRoot, _startDate, _endDate, _encryptionKey, _msgSender()));
    }

}
