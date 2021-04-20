import { expect } from "chai"
import { Contract, Wallet } from "ethers"
import {
    createElektonProof,
    delay,
    deployContract,
    createAccounts,
    getLastBlockTimestamp,
    getTreeRoot,
    stringToBytes32,
    waitConfirmations
} from "../scripts/utils"

describe("Core tests", () => {
    let elekton: Contract
    let accounts: { wallet: Wallet; voter: any }[]
    let elektonUser1: Contract

    before(async () => {
        accounts = await createAccounts()
        elekton = await deployContract("Elekton", accounts[0].wallet)
        elektonUser1 = elekton.connect(accounts[1].wallet)
    })

    describe("#createUser()", () => {
        let user1Address: string

        before(async () => {
            user1Address = await accounts[1].wallet.getAddress()
        })

        for (let i = 1; i < 5; i++) {
            const data = stringToBytes32(i.toString())

            it(`User ${i} should add himself`, async () => {
                const elektonUser = elekton.connect(accounts[i].wallet)
                const address = await accounts[i].wallet.getAddress()

                await expect(waitConfirmations(elektonUser.createUser(data)))
                    .to.emit(elekton, "UserCreated")
                    .withArgs(address, data)
            })
        }

        it(`User 1 should not update his data with the same reference`, async () => {
            const data = stringToBytes32("1")

            await expect(waitConfirmations(elektonUser1.createUser(data))).to.be.reverted
        })

        it(`User 1 should update his data with another reference`, async () => {
            const data = stringToBytes32("5")

            await expect(waitConfirmations(elektonUser1.createUser(data)))
                .to.emit(elekton, "UserUpdated")
                .withArgs(user1Address, data)
        })
    })

    describe("#createBallot()", () => {
        let ballotData: string
        let treeRoot: bigint

        before(async () => {
            ballotData = stringToBytes32("data") as string
            treeRoot = getTreeRoot(accounts.slice(1, 5).map((account) => account.voter.publicKey))
        })

        it("An unregistered user should not create a ballot", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 2
            const endDate = timestamp + 12

            await expect(waitConfirmations(elekton.createBallot(ballotData, treeRoot, startDate, endDate))).to.be
                .reverted
        })

        it("A ballot should not start in the past", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp - 2
            const endDate = timestamp + 2

            await expect(waitConfirmations(elektonUser1.createBallot(ballotData, treeRoot, startDate, endDate))).to.be
                .reverted
        })

        it("A ballot start date should not be less than its end date", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 2
            const endDate = timestamp + 1

            await expect(waitConfirmations(elektonUser1.createBallot(ballotData, treeRoot, startDate, endDate))).to.be
                .reverted
        })

        it("User 1 should create ballot 0 with 4 voters (users 1, 2, 3, 4)", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 5
            const endDate = timestamp + 100

            await expect(waitConfirmations(elektonUser1.createBallot(ballotData, treeRoot, startDate, endDate)))
                .to.emit(elekton, "BallotCreated")
                .withArgs(0)
        })
    })

    describe("#vote()", () => {
        let ballotData: string
        let voterPublicKeys: any
        let treeRoot: bigint
        let vote: bigint

        before(async () => {
            ballotData = stringToBytes32("data") as string
            voterPublicKeys = accounts.slice(1, 5).map((account) => account.voter.publicKey)
            treeRoot = getTreeRoot(voterPublicKeys)
            vote = 2n
        })

        it("An user should not vote on a non-existent ballot", async () => {
            const ballotIndex = 1n
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })

        it("An user should not vote in advance", async () => {
            const ballotIndex = 1n
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 100
            const endDate = timestamp + 1000
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await waitConfirmations(elektonUser1.createBallot(ballotData, treeRoot, startDate, endDate))

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })

        it("An user should not vote late", async () => {
            const ballotIndex = 2n
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 5
            const endDate = timestamp + 6
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await waitConfirmations(elektonUser1.createBallot(ballotData, treeRoot, startDate, endDate))

            await delay(6000)

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })

        it("An user should not vote on ballot with a wrong smt root", async () => {
            const ballotIndex = 0n
            const wrongVoterPublicKeys = accounts.slice(1, 6).map((account) => account.voter.publicKey)
            const proof = await createElektonProof(wrongVoterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })

        for (let i = 1; i < 5; i++) {
            it(`User ${i} should vote anonymously on ballot 0`, async () => {
                const ballotIndex = 0n
                const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[i].voter, vote)

                await expect(waitConfirmations(elekton.vote(...proof)))
                    .to.emit(elekton, "VoteAdded")
                    .withArgs(ballotIndex, vote)
            })
        }

        it("An user should not vote twice", async () => {
            const ballotIndex = 0n
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })

        it("An user should not vote with a invalid proof", async () => {
            const ballotIndex = 0n
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[0].voter, vote)

            await expect(waitConfirmations(elekton.vote(...proof))).to.be.reverted
        })
    })

    describe("#publishDecryptionKey()", () => {
        let ballotIndex: bigint
        let decryptionKey: bigint

        before(() => {
            ballotIndex = 0n
            decryptionKey = 122n
        })

        it("An user should not publish a decryption key on a ballot of another user", async () => {
            const elektonUser2 = elekton.connect(accounts[2].wallet)

            await expect(waitConfirmations(elektonUser2.publishDecryptionKey(ballotIndex, decryptionKey))).to.be
                .reverted
        })

        it("User 1 should not publish the decryption key before his ballot ends", async () => {
            await expect(waitConfirmations(elektonUser1.publishDecryptionKey(ballotIndex, decryptionKey))).to.be
                .reverted
        })

        it("User 1 should publish the decryption key when his ballot ends", async () => {
            await delay(6000)

            await expect(waitConfirmations(elektonUser1.publishDecryptionKey(ballotIndex, decryptionKey)))
                .to.emit(elekton, "DecryptionKeyPublished")
                .withArgs(ballotIndex, decryptionKey)
        })
    })
})
