// SPDX-License-Identifier: MIT

pragma solidity ^0.6.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@nomiclabs/buidler/console.sol";
import "./Verifier.sol";


contract Elekton is Ownable, Verifier {

    event UserCreated (address indexed);

    struct User {
        bytes32 name;
        bytes32 surname;
        bytes32 username;
        bool isAdmin;
    }

    struct Election {
        bytes32[] electors;
        uint[] votes;
    }

    mapping(address => User) private users;
    mapping(bytes32 => bool) private usernames;
    mapping(uint => Election) private elections;

    function createAdmin(bytes32 _name, bytes32 _surname, bytes32 _username) external {
        createUser(_name, _surname, _username, true, _msgSender());
    }

    function createElector(bytes32 _name, bytes32 _surname, bytes32 _username) external {
        createUser(_name, _surname, _username, false, _msgSender());
    }

    function getUser() external view returns (bytes32 name, bytes32 surname, bytes32 username, bool isAdmin) {
        User storage user = users[_msgSender()];

        return (user.name, user.surname, user.username, user.isAdmin);
    }

    function createUser(bytes32 _name, bytes32 _surname, bytes32 _username, bool _isAdmin, address _address) private {
        require(!usernames[_username], "username-already-exists");

        User storage user = users[_address];

        user.name = _name;
        user.surname = _surname;
        user.username = _username;
        user.isAdmin = _isAdmin;

        usernames[_username] = true;

        emit UserCreated(_address);
    }

    function createElection(uint _id, bytes32[] calldata _electors) external {
        Election storage election = elections[_id];

        election.electors = _electors;
    }

    function getElection(uint _id) external view returns (bytes32[] memory electors, uint[] memory votes) {
        Election storage election = elections[_id];

        return (election.electors, election.votes);
    }

    function vote(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[4] memory input) external {
        require(verifyProof(a, b, c, input), "invalid-proof");

        Election storage election = elections[input[2]];

        election.votes.push(input[1]);
    }

}
