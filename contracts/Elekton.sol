// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

import "./Verifier.sol";

/// @title Simple anonymous voting contract
/// @author Omar Desogus
/// @dev Elekton allows you to manage the users of the voting system, to
/// create ballot, to vote anonymously and to publish the key to decrypt votes.
/// The votes may possibly also not be encrypted, and in this case the
/// count can be calculated externally in real time.
/// All data not necessary for the logic of the contract must be saved externally.
/// The id parameter can be used for a reference to external data.
/// For errors, codes are used, the first character `E` indicates that it is an error,
/// the second digit indicates the scope (users = 0, ballot = 1, vote = 2),
/// the last two a progressive id.
contract Elekton is Verifier {

    /// @dev Emitted when a user is created.
    /// @param _address: user address.
    /// @param _userId: user id.
    event UserCreated (address _address, uint _userId);

    /// @dev Emitted when the user id is updated.
    /// @param _address: user address.
    /// @param _userId: new user id.
    event UserUpdated (address _address, uint _userId);

    /// @dev Emitted when a ballot is created.
    /// @param _ballotId: ballot id.
    event BallotCreated (uint _ballotId);

    /// @dev Emitted when a user votes on a ballot.
    /// @param _ballotId: ballot id.
    /// @param _vote: user vote (encrypted or not).
    event VoteAdded (uint indexed _ballotId, uint _vote);

    /// @dev Emitted when a decryption key is published.
    /// @param _ballotId: ballot id.
    /// @param _decryptionKey: decryption key.
    event DecryptionKeyPublished (uint _ballotId, uint _decryptionKey);

    // Ballot struct contains all the parameters needed to manage time, votes and voters.
    struct Ballot {
        address admin; // Address of the ballot creator.
        uint smtRoot; // Root of the census tree.
        uint startDate; // Ballot start timestamp.
        uint endDate; // Ballot end timestamp.
        uint[] votes; // List of votes (encrypted or not).
        uint decryptionKey; // Key to decrypt the votes.
    }

    /// @dev Gets an user address and returns his id.
    /// @return user id.
    mapping(address => uint) public users;

    /// @dev Gets a ballot id and returns its data.
    /// @return ballot data.
    mapping(uint => Ballot) public ballots;

    /// @dev Gets the vote nullifier and returns a bool.
    /// Nullifier is a Poseidon hash of the ballot id and the voter private key.
    /// This mapping is useful for preventing a voter from voting twice.
    mapping(uint => bool) voteNullifier;

    /// @dev Creates a user saving his id in the `users` mapping, or, if
    /// the user already exists, updates his old id.
    /// @param _userId: user id.
    function createUser(uint _userId) external {
        require(_userId != 0, "E000"); // User id must be different from 0.
        require(users[msg.sender] != _userId, "E001"); // New user id must be different from current id.

        uint currentId = users[msg.sender];

        users[msg.sender] = _userId;

        if (currentId == 0) {
            emit UserCreated(msg.sender, _userId);
        } else {
            emit UserUpdated(msg.sender, _userId);
        }
    }

    /// @dev Creates a ballot saving its data in the `ballots` mapping.
    /// @param _ballotId: ballot id.
    /// @param _smtRoot: root of the census tree.
    /// @param _startDate: ballot start timestamp.
    /// @param _endDate: ballot end timestamp.
    function createBallot(uint _ballotId, uint _smtRoot, uint _startDate, uint _endDate) external {
        require(ballots[_ballotId].startDate == 0, "E100"); // Ballot id already exist.
        require(users[msg.sender] != 0, "E101"); // User must exist.
        require(_startDate >= block.timestamp, "E102"); // Start date cannot be in the past.
        require(_startDate + 10 seconds <= _endDate, "E103"); // Time interval is too short.

        ballots[_ballotId].admin = msg.sender;
        ballots[_ballotId].smtRoot = _smtRoot;
        ballots[_ballotId].startDate = _startDate;
        ballots[_ballotId].endDate = _endDate;

        emit BallotCreated(_ballotId);
    }

    /// @dev Adds a vote on the ballot, verifying the zk-snark proof that the user
    /// is enabled to vote without revealing the user's identity.
    /// @param _a: proof parameter.
    /// @param _b: proof parameter.
    /// @param _c: proof parameter.
    /// @param _input: array of public proof parameters, in order: smtRoot, vote, ballotId, voteNullifier.
    function vote(uint[2] calldata _a, uint[2][2] calldata _b, uint[2] calldata _c, uint[4] calldata _input) external {
        require(ballots[_input[2]].admin!= address(0), "E200"); // Ballot id is wrong.
        require(block.timestamp > ballots[_input[2]].startDate, "E201"); // Invalid vote in advance.
        require(block.timestamp < ballots[_input[2]].endDate, "E202"); // Invalid late vote.
        require(_input[0] == ballots[_input[2]].smtRoot, "E203"); // SMT root is wrong.
        require(!voteNullifier[_input[3]], "E204"); // User has already voted.
        require(verifyProof(_a, _b, _c, _input), "E205"); // Voting proof is wrong.

        voteNullifier[_input[3]] = true;
        ballots[_input[2]].votes.push(_input[1]);

        emit VoteAdded(_input[2], _input[1]);
    }

    /// @dev Publishes the key to decrypt the votes of a ballot.
    /// @param _ballotId: ballot id.
    /// @param _decryptionKey: decryption key.
    function publishDecryptionKey(uint _ballotId, uint _decryptionKey) external {
        require(ballots[_ballotId].admin == msg.sender, "E104"); // User is not the ballot admin.
        require(block.timestamp > ballots[_ballotId].endDate, "E105"); // Decryption key can be published after ballot end date.

        ballots[_ballotId].decryptionKey = _decryptionKey;

        emit DecryptionKeyPublished(_ballotId, _decryptionKey);
    }

}
