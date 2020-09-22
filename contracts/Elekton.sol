// SPDX-License-Identifier: MIT

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@nomiclabs/buidler/console.sol";


contract Elekton is Ownable {

    /** Events & structures **/

    event UserCreated (address indexed);

    struct User {
        bytes32 name;
        bytes32 surname;
        bytes32 username;
        bool isAdmin;
    }

    /** Storage **/

    mapping(address => User) private users;
    mapping(bytes32 => bool) private usernames;

    /** Functions **/

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

}
