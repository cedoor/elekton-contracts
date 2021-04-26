// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

import "./Verifier.sol";

/// @title Simple anonymous voting contract
/// @author Omar Desogus
/// @dev Elekton contract allows you to add users and allows these users to
/// create ballots, vote anonymously and publish the key to decrypt votes.
/// The votes may possibly also not be encrypted, and in this case the
/// count can be calculated externally in real time.
/// All data not necessary for the logic of the contract must be saved externally,
/// and a reference is saved in this contract.
/// Contract error messages are represented by specific codes: a first character `E`
/// followed by a digit for the scope (users = 0, ballot = 1, vote = 2),
/// and by two digits with a progressive id.
contract Elekton is Verifier {

    /// @dev Emitted when a user is created.
    /// @param _address: user address.
    /// @param _data: user data reference.
    event UserCreated (address _address, bytes32 _data);

    /// @dev Emitted when the user data is updated.
    /// @param _address: user address.
    /// @param _data: new user data reference.
    event UserUpdated (address _address, bytes32 _data);

    /// @dev Emitted when a ballot is created.
    /// @param _index: ballot index.
    event BallotCreated (uint _index);

    /// @dev Emitted when a user votes on a ballot.
    /// @param _index: ballot index.
    /// @param _vote: user vote (encrypted or not).
    event VoteAdded (uint indexed _index, uint _vote);

    /// @dev Emitted when a decryption key is published.
    /// @param _index: ballot index.
    /// @param _decryptionKey: decryption key.
    event DecryptionKeyPublished (uint indexed _index, uint _decryptionKey);

    // Ballot structure contains all the parameters needed to manage time, votes and voters.
    struct Ballot {
        bytes32 data; // External data reference.
        address admin; // Address of the ballot creator.
        uint smtRoot; // Root of the census tree.
        uint startDate; // Ballot start timestamp.
        uint endDate; // Ballot end timestamp.
    }

    /// @dev Gets an user address and returns his data reference.
    /// @return user data reference.
    mapping(address => bytes32) public users;

    /// @dev Gets a ballot index and returns the ballot.
    /// @return ballot.
    Ballot[] public ballots;

    /// @dev Gets the vote nullifier and returns a bool.
    /// Nullifier is a Poseidon hash of the ballot index and the voter private key.
    /// This mapping is useful for preventing a voter from voting twice.
    mapping(uint => bool) public voteNullifier;

    /// @dev Creates a user saving his data reference in the `users` mapping, or, if
    /// the user already exists, updates his old data reference.
    /// @param _data: user data reference.
    function createUser(bytes32 _data) external {
        require(users[msg.sender] != _data, "E000"); // New user data must be different from the current data.

        uint currentData = uint(users[msg.sender]);

        users[msg.sender] = _data;

        if (currentData == 0) {
            emit UserCreated(msg.sender, _data);
        } else {
            emit UserUpdated(msg.sender, _data);
        }
    }

    /// @dev Creates a ballot saving its data in the `ballots` mapping.
    /// @param _data: ballot data reference.
    /// @param _smtRoot: root of the census tree.
    /// @param _startDate: ballot start timestamp.
    /// @param _endDate: ballot end timestamp.
    function createBallot(bytes32 _data, uint _smtRoot, uint _startDate, uint _endDate) external {
        require(users[msg.sender] != 0, "E100"); // User must exist.
        require(_startDate >= block.timestamp, "E101"); // Start date cannot be in the past.
        require(_startDate < _endDate, "E102"); // Start date must be after end date.

        Ballot memory ballot;

        ballot.data = _data;
        ballot.admin = msg.sender;
        ballot.smtRoot = _smtRoot;
        ballot.startDate = _startDate;
        ballot.endDate = _endDate;

        ballots.push(ballot);

        emit BallotCreated(ballots.length - 1);
    }

    /// @dev Adds a vote on the ballot, verifying the zk-snark proof that the user
    /// is enabled to vote without revealing the user's identity.
    /// @param _a: proof parameter.
    /// @param _b: proof parameter.
    /// @param _c: proof parameter.
    /// @param _input: array of public proof parameters, in order: smtRoot, vote, ballotId, voteNullifier.
    function vote(uint[2] calldata _a, uint[2][2] calldata _b, uint[2] calldata _c, uint[4] calldata _input) external {
        require(_input[2] < ballots.length, "E200"); // Ballot index is wrong.
        require(block.timestamp > ballots[_input[2]].startDate, "E201"); // Invalid vote in advance.
        require(block.timestamp < ballots[_input[2]].endDate, "E202"); // Invalid late vote.
        require(_input[0] == ballots[_input[2]].smtRoot, "E203"); // SMT root is wrong.
        require(!voteNullifier[_input[3]], "E204"); // User has already voted.
        require(verifyProof(_a, _b, _c, _input), "E205"); // Voting proof is wrong.

        voteNullifier[_input[3]] = true;

        emit VoteAdded(_input[2], _input[1]);
    }

    /// @dev Publishes the key to decrypt the votes of a ballot.
    /// @param _ballotIndex: ballot index.
    /// @param _decryptionKey: decryption key.
    function publishDecryptionKey(uint _ballotIndex, uint _decryptionKey) external {
        require(ballots[_ballotIndex].admin == msg.sender, "E104"); // User is not the ballot admin.
        require(block.timestamp > ballots[_ballotIndex].endDate, "E105"); // Decryption key can be published after ballot end date.

        emit DecryptionKeyPublished(_ballotIndex, _decryptionKey);
    }

}
