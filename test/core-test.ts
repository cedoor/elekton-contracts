import { expect } from "chai"
import { Contract } from "ethers"
import {
    createElektonProof,
    delay,
    deployContract,
    getAccounts,
    getLastBlockTimestamp,
    getSmt,
    stringToBytes32,
    waitConfirmations
} from "../scripts/utils"

describe("Core tests", () => {
    let elekton: Contract
    let accounts: any[]
    let elektonUser1: Contract

    before(async () => {
        elekton = await deployContract("Elekton")
        accounts = await getAccounts()
        elektonUser1 = elekton.connect(accounts[1].signer)
    })

    describe("#createUser()", () => {
        let user1Address: string

        before(async () => {
            user1Address = await accounts[1].signer.getAddress()
        })

        for (let i = 1; i < 5; i++) {
            const data = stringToBytes32(i.toString())

            it(`User ${i} should add himself`, async () => {
                const elektonUser = elekton.connect(accounts[i].signer)
                const address = await accounts[i].signer.getAddress()

                await expect(waitConfirmations(elektonUser.createUser(data)))
                    .to.emit(elekton, "UserCreated")
                    .withArgs(address, data)
            })
        }

        it(`User 1 should not update his data with the same reference`, async () => {
            const data = stringToBytes32("1")

            await expect(elektonUser1.createUser(data)).to.be.revertedWith("E000")
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
        let smt: any

        before(async () => {
            ballotData = stringToBytes32("data") as string
            smt = await getSmt(accounts.slice(1, 5).map((account) => account.voter.publicKey))
        })

        it("An unregistered user should not create a ballot", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 2
            const endDate = timestamp + 12

            await expect(elekton.createBallot(ballotData, smt.root, startDate, endDate)).to.be.revertedWith("E100")
        })

        it("A ballot should not start in the past", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp - 2
            const endDate = timestamp + 10

            await expect(elektonUser1.createBallot(ballotData, smt.root, startDate, endDate)).to.be.revertedWith("E101")
        })

        it("A ballot should not last less than 10 seconds", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 2
            const endDate = timestamp + 10

            await expect(elektonUser1.createBallot(ballotData, smt.root, startDate, endDate)).to.be.revertedWith("E102")
        })

        it("User 1 should create ballot 0 with 4 voters (users 1, 2, 3, 4)", async () => {
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 2
            const endDate = timestamp + 54

            await expect(waitConfirmations(elektonUser1.createBallot(ballotData, smt.root, startDate, endDate)))
                .to.emit(elekton, "BallotCreated")
                .withArgs(0)
        })
    })

    describe("#vote()", () => {
        let ballotData: string
        let voterPublicKeys: any
        let smt: any
        let vote: BigInt

        before(async () => {
            ballotData = stringToBytes32("data") as string
            voterPublicKeys = accounts.slice(1, 5).map((account) => account.voter.publicKey)
            smt = await getSmt(voterPublicKeys)
            vote = 2n
        })

        it("An user should not vote on a non-existent ballot", async () => {
            const ballotIndex = 1n
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await expect(elekton.vote(...proof)).to.be.revertedWith("E200")
        })

        it("An user should not vote in advance", async () => {
            const ballotIndex = 1n
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 100
            const endDate = timestamp + 1000
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await waitConfirmations(elektonUser1.createBallot(ballotData, smt.root, startDate, endDate))

            await expect(elekton.vote(...proof)).to.be.revertedWith("E201")
        })

        it("An user should not vote late", async () => {
            const ballotIndex = 2n
            const timestamp = await getLastBlockTimestamp(elekton.provider)
            const startDate = timestamp + 4
            const endDate = timestamp + 14
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await waitConfirmations(elektonUser1.createBallot(ballotData, smt.root, startDate, endDate))

            await delay(14000)

            await expect(elekton.vote(...proof)).to.be.revertedWith("E202")
        })

        it("An user should not vote on ballot with a wrong smt root", async () => {
            const ballotIndex = 0n
            const wrongVoterPublicKeys = accounts.slice(1, 6).map((account) => account.voter.publicKey)
            const proof = await createElektonProof(wrongVoterPublicKeys, ballotIndex, accounts[1].voter, vote)

            await expect(elekton.vote(...proof)).to.be.revertedWith("E203")
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

            await expect(elekton.vote(...proof)).to.be.revertedWith("E204")
        })

        it("An user should not vote with a invalid proof", async () => {
            const ballotIndex = 0n
            const proof = await createElektonProof(voterPublicKeys, ballotIndex, accounts[0].voter, vote)

            await expect(elekton.vote(...proof)).to.be.revertedWith("E205")
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
            const elektonUser2 = elekton.connect(accounts[2].signer)

            await expect(elektonUser2.publishDecryptionKey(ballotIndex, decryptionKey)).to.be.revertedWith("E104")
        })

        it("User 1 should not publish the decryption key before his ballot ends", async () => {
            await expect(elektonUser1.publishDecryptionKey(ballotIndex, decryptionKey)).to.be.revertedWith("E105")
        })

        it("User 1 should publish the decryption key when his ballot ends", async () => {
            await delay(5000)

            await expect(waitConfirmations(elektonUser1.publishDecryptionKey(ballotIndex, decryptionKey)))
                .to.emit(elekton, "DecryptionKeyPublished")
                .withArgs(ballotIndex, decryptionKey)
        })
    })
})
