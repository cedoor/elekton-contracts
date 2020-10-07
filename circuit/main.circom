include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/pointbits.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/smt/smtverifier.circom";

template Elekton (nLevels) {
    signal private input privateKey;
    signal private input R8x;
    signal private input R8y;
    signal private input S;
    signal private input smtSiblings[nLevels];
    signal input smtRoot;
    signal input encryptedVote;
    signal input electionId;
    signal input nullifier;

    var i;

    component babyPbk = BabyPbk();
    babyPbk.in <== privateKey;

    component smtVerifier = SMTVerifier(nLevels);
    smtVerifier.enabled <== 1;
    smtVerifier.root <== smtRoot
    for (i = 0; i < nLevels; i++) smtVerifier.siblings[i] <== smtSiblings[i];
    smtVerifier.oldKey <== 0;
    smtVerifier.oldValue <== 0;
    smtVerifier.isOld0 <== 0;
    smtVerifier.key <== babyPbk.Ax;
    smtVerifier.value <== babyPbk.Ay;
    smtVerifier.fnc <== 0;

    component eddsaPoseidonVerifier = EdDSAPoseidonVerifier();
    eddsaPoseidonVerifier.enabled <== 1;
    eddsaPoseidonVerifier.Ax <== babyPbk.Ax;
    eddsaPoseidonVerifier.Ay <== babyPbk.Ay;
    eddsaPoseidonVerifier.R8x <== R8x;
    eddsaPoseidonVerifier.R8y <== R8y;
    eddsaPoseidonVerifier.S <== S;
    eddsaPoseidonVerifier.M <== encryptedVote;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== electionId;
    poseidon.inputs[1] <== privateKey;

    nullifier === poseidon.out;
}

component main = Elekton(10);
