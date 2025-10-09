import { expect } from "chai";
import { encodeBytes32String, parseUnits, Signer } from "ethers";
import {
  getSigners,
  deployContract,
  EMode,
  MessageProcessor,
  MockVerifier,
  VkRegistry,
  MessageProcessor__factory as MessageProcessorFactory,
  IVerifyingKeyStruct,
} from "maci-contracts";
import { genTreeProof } from "maci-crypto";
import { Keypair, Message, PCommand, PubKey } from "maci-domainobjs";

import {
  Tally,
  ERC20,
  Poll,
  IRecipientRegistry,
  MACI,
  Poll__factory as PollFactory,
  Tally__factory as TallyFactory,
} from "../typechain-types";

import {
  INITIAL_VOICE_CREDIT_BALANCE,
  MESSAGE_BATCH_SIZE,
  PER_VO_SPENT_VOICE_CREDITS,
  STATE_TREE_DEPTH,
  TALLY_RESULTS,
  TEST_PROCESS_VK,
  TEST_TALLY_VK,
  TOTAL_SPENT_VOICE_CREDITS,
  treeDepths,
} from "./constants";
import { deployTestContracts, timeTravel } from "./utils";

describe("Tally", () => {
  let payoutToken: ERC20;
  let poll: Poll;
  let tally: Tally;
  let maci: MACI;
  let messageProcessor: MessageProcessor;
  let registry: IRecipientRegistry;
  let verifier: MockVerifier;
  let vkRegistry: VkRegistry;
  let owner: Signer;
  let custodian: Signer;
  let user: Signer;
  let project: Signer;

  let ownerAddress: string;
  let custodianAddress: string;
  let userAddress: string;
  let projectAddress: string;

  const maxRecipients = TALLY_RESULTS.tally.length;

  const metadataUrl = encodeBytes32String("url");
  const duration = 100;
  const cooldownTime = 100;
  const keypair = new Keypair();

  const emptyClaimParams = {
    index: 0,
    voiceCreditsPerOption: 0,
    tallyResult: 0,
    totalSpent: 0,
    tallyResultProof: [],
    tallyResultSalt: 0,
    voteOptionTreeDepth: 0,
    spentVoiceCreditsHash: 0,
    perVOSpentVoiceCreditsHash: 0,
  };

  before(async () => {
    [owner, custodian, user, project] = await getSigners();
    [ownerAddress, custodianAddress, userAddress, projectAddress] = await Promise.all([
      owner.getAddress(),
      custodian.getAddress(),
      user.getAddress(),
      project.getAddress(),
    ]);

    payoutToken = await deployContract("MockERC20", owner, true, "Payout token", "PT");

    const contracts = await deployTestContracts({
      initialVoiceCreditBalance: INITIAL_VOICE_CREDIT_BALANCE,
      stateTreeDepth: STATE_TREE_DEPTH,
      signer: owner,
    });
    maci = contracts.maciContract;
    verifier = contracts.mockVerifierContract;
    vkRegistry = contracts.vkRegistryContract;

    await vkRegistry.setVerifyingKeys(
      STATE_TREE_DEPTH,
      treeDepths.intStateTreeDepth,
      treeDepths.messageTreeDepth,
      treeDepths.voteOptionTreeDepth,
      MESSAGE_BATCH_SIZE,
      EMode.QV,
      TEST_PROCESS_VK.asContractParam() as IVerifyingKeyStruct,
      TEST_TALLY_VK.asContractParam() as IVerifyingKeyStruct,
    );

    await maci
      .deployPoll(duration, treeDepths, keypair.pubKey.asContractParam(), verifier, vkRegistry, EMode.QV)
      .then((tx) => tx.wait());

    registry = await deployContract("SimpleRegistry", owner, true, maxRecipients, metadataUrl, ownerAddress);

    await maci.setPollRegistry(0n, registry).then((tx) => tx.wait());
    await maci.initPoll(0n).then((tx) => tx.wait());

    const pollContracts = await maci.getPoll(0n);
    poll = PollFactory.connect(pollContracts.poll, owner);
    tally = TallyFactory.connect(pollContracts.tally, owner);
    messageProcessor = MessageProcessorFactory.connect(pollContracts.messageProcessor, owner);

    const messages: [Message, PubKey][] = [];
    for (let i = 0; i < 2; i += 1) {
      const command = new PCommand(1n, keypair.pubKey, 0n, 9n, 1n, 0n, BigInt(i));
      const signature = command.sign(keypair.privKey);
      const sharedKey = Keypair.genEcdhSharedKey(keypair.privKey, keypair.pubKey);
      const message = command.encrypt(signature, sharedKey);
      messages.push([message, keypair.pubKey]);
    }

    await maci
      .signUp(
        keypair.pubKey.asContractParam(),
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      )
      .then((tx) => tx.wait());

    await poll
      .publishMessageBatch(
        messages.map(([m]) => m.asContractParam()),
        messages.map(([, k]) => k.asContractParam()),
      )
      .then((tx) => tx.wait());
  });

  it("should deploy and initialize with small contribution amount properly", async () => {
    await maci
      .deployPoll(duration, treeDepths, keypair.pubKey.asContractParam(), verifier, vkRegistry, EMode.QV)
      .then((tx) => tx.wait());

    await maci.setPollRegistry(1n, registry).then((tx) => tx.wait());
    await maci.initPoll(1n).then((tx) => tx.wait());

    const pollContracts = await maci.getPoll(1n);
    const tallyContract = TallyFactory.connect(pollContracts.tally, owner);

    const receipt = await tallyContract
      .init({
        cooldownTime,
        custodian: custodianAddress,
        maxContribution: 1,
        maxCap: 100000,
        payoutToken,
      })
      .then((tx) => tx.wait());

    expect(receipt?.status).to.equal(1);
    expect(await tallyContract.voiceCreditFactor()).to.equal(1n);
  });

  it("should not allow to deposit/claim/addTallyResults before initialization", async () => {
    await expect(tally.deposit(1n)).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(tally.withdraw()).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "NotInitialized");
    await expect(
      tally.addTallyResults({
        voteOptionIndices: [],
        tallyResults: [],
        tallyResultProofs: [],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "NotInitialized");
  });

  it("should not allow non-owner to initialize tally", async () => {
    await expect(
      tally.connect(user).init({
        cooldownTime,
        custodian: custodianAddress,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        maxCap: parseUnits("100000", await payoutToken.decimals()),
        payoutToken,
      }),
    ).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should initialize tally properly", async () => {
    const receipt = await tally
      .init({
        cooldownTime,
        custodian: custodianAddress,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        maxCap: parseUnits("100000", await payoutToken.decimals()),
        payoutToken,
      })
      .then((tx) => tx.wait());

    expect(receipt?.status).to.equal(1);
  });

  it("should not allow to initialize tally twice", async () => {
    await expect(
      tally.init({
        cooldownTime,
        custodian: custodianAddress,
        maxContribution: parseUnits("5", await payoutToken.decimals()),
        maxCap: parseUnits("100000", await payoutToken.decimals()),
        payoutToken,
      }),
    ).to.be.revertedWithCustomError(tally, "AlreadyInitialized");
  });

  it("should not withdraw to custodian if cooldown period is not over", async () => {
    await expect(tally.withdraw()).to.be.revertedWithCustomError(tally, "CooldownPeriodNotOver");
  });

  it("should not allow non-owner to withdraw funds", async () => {
    await expect(tally.connect(user).withdraw()).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should not allow non-owner to add tally results", async () => {
    await expect(
      tally.connect(user).addTallyResults({
        voteOptionIndices: [],
        tallyResults: [],
        tallyResultProofs: [],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "OwnableUnauthorizedAccount");
  });

  it("should not allow to claim before tallying", async () => {
    await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
  });

  it("should not allow to calculate amount if votes are not tallied", async () => {
    await expect(tally.getAllocatedAmounts([])).to.be.revertedWithCustomError(tally, "VotesNotTallied");
    await expect(tally.getAllocatedAmount(0, 0)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
    await expect(tally.calculateAlpha(0)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
  });

  it("should merge properly", async () => {
    await timeTravel(duration, owner);

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await registry
        .addRecipient({
          id: encodeBytes32String(index.toString()),
          metadataUrl,
          recipient: projectAddress,
        })
        .then((tx) => tx.wait());
    }

    await poll.mergeMaciState().then((tx) => tx.wait());
    await poll.mergeMessageAqSubRoots(4).then((tx) => tx.wait());
    await poll.mergeMessageAq().then((tx) => tx.wait());

    const [numSignups, numMessages] = await poll.numSignUpsAndMessages();

    expect(numSignups).to.equal(2);
    expect(numMessages).to.equal(3);
  });

  it("should not allow to claim before tallying without results", async () => {
    await expect(tally.claim(emptyClaimParams)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
  });

  it("should not allow to calculate amount if votes are not tallied without results", async () => {
    await expect(tally.getAllocatedAmounts([])).to.be.revertedWithCustomError(tally, "VotesNotTallied");
    await expect(tally.getAllocatedAmount(0, 0)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
    await expect(tally.calculateAlpha(0)).to.be.revertedWithCustomError(tally, "VotesNotTallied");
  });

  it("should not allow a deposit of 0", async () => {
    await expect(tally.deposit(0n)).to.revertedWithCustomError(tally, "DepositMustBeGreaterThanZero");
  });

  it("should deposit funds properly", async () => {
    const [decimals, initialBalance] = await Promise.all([payoutToken.decimals(), payoutToken.balanceOf(owner)]);
    const ownerAmount = parseUnits(TOTAL_SPENT_VOICE_CREDITS.spent, decimals);
    const userAmount = parseUnits("2", decimals);

    await payoutToken.approve(user, userAmount).then((tx) => tx.wait());
    await payoutToken.transfer(user, userAmount);

    await payoutToken.approve(tally, ownerAmount).then((tx) => tx.wait());
    await expect(tally.deposit(ownerAmount)).to.emit(tally, "Deposited").withArgs(ownerAddress, ownerAmount);

    await payoutToken
      .connect(user)
      .approve(tally, userAmount)
      .then((tx) => tx.wait());
    await expect(tally.connect(user).deposit(userAmount)).to.emit(tally, "Deposited").withArgs(userAddress, userAmount);

    const [tokenBalance, totalAmount] = await Promise.all([payoutToken.balanceOf(tally), tally.totalAmount()]);

    expect(totalAmount).to.equal(tokenBalance);
    expect(initialBalance - tokenBalance).to.equal(initialBalance - ownerAmount - userAmount);
  });

  it("should add tally results properly", async () => {
    await messageProcessor.processMessages(0n, [0, 0, 0, 0, 0, 0, 0, 0]);
    await tally.tallyVotes(
      16314492373388736967790160553643622877652062027311228078826397128502181670780n,
      [0, 0, 0, 0, 0, 0, 0, 0],
    );

    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const indices = TALLY_RESULTS.tally.map((_, index) => index);
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    await expect(
      tally.addTallyResults({
        voteOptionIndices: [0],
        tallyResults: [TALLY_RESULTS.tally[0]],
        tallyResultProofs: [invalidProof],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "InvalidTallyVotesProof");

    await expect(tally.calculateAlpha(TOTAL_SPENT_VOICE_CREDITS.spent)).to.be.revertedWithCustomError(
      tally,
      "NoProjectHasMoreThanOneVote",
    );

    const promise = await tally
      .addTallyResults({
        voteOptionIndices: indices.slice(1),
        tallyResults: tallyResults.slice(1),
        tallyResultProofs: tallyResultProofs.slice(1),
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      })
      .then((tx) => tx.wait());

    for (let index = 1; index < indices.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      await expect(promise).to.emit(tally, "ResultAdded").withArgs(index, tallyResults[index]);
    }

    const voiceCreditFactor = await tally.voiceCreditFactor();

    await expect(
      tally.calculateAlpha(BigInt(TOTAL_SPENT_VOICE_CREDITS.spent) * voiceCreditFactor),
    ).to.be.revertedWithCustomError(tally, "NotCompletedResults");

    const additionalProof = genTreeProof(tallyResults.length, tallyResults.concat(0n), treeDepths.voteOptionTreeDepth);

    await expect(
      tally.addTallyResults({
        voteOptionIndices: [indices[0], tallyResults.length],
        tallyResults: [tallyResults[0], 0n],
        tallyResultProofs: [tallyResultProofs[0], additionalProof],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "TooManyResults");

    await expect(
      tally.addTallyResults({
        voteOptionIndices: indices.slice(0, 1),
        tallyResults: tallyResults.slice(0, 1),
        tallyResultProofs: tallyResultProofs.slice(0, 1),
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    )
      .to.emit(tally, "ResultAdded")
      .withArgs(0, tallyResults[0]);
  });

  it("should not allow deposits after tallying", async () => {
    const amount = parseUnits("1", await payoutToken.decimals());
    await payoutToken.approve(tally, amount).then((tx) => tx.wait());

    await expect(tally.deposit(amount)).to.be.revertedWithCustomError(tally, "VotesAlreadyTallied");
  });

  it("should not withdraw to custodian if cooldown period is equal to timestamp", async () => {
    const [deployTime] = await poll.getDeployTimeAndDuration();
    const blockTimestamp = (await owner.provider!.getBlock("latest"))!.timestamp;

    const secondsSinceDeploy = blockTimestamp - Number(deployTime);
    const totalTime = Number(duration) + cooldownTime;

    // -1 is needed because get latest block is one second behind block when withdraw is called
    const remainingCooldown = totalTime - secondsSinceDeploy - 1;

    await timeTravel(remainingCooldown, owner);

    await expect(tally.withdraw()).to.be.revertedWithCustomError(tally, "CooldownPeriodNotOver");

    // Check seconds passed is equal to totalTime
    const blockTimestamp2 = (await owner.provider!.getBlock("latest"))!.timestamp;
    const secondsSinceDeploy2 = blockTimestamp2 - Number(deployTime);
    expect(secondsSinceDeploy2).to.be.equal(totalTime);
  });

  it("should not allow to add tally results twice", async () => {
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    await expect(
      tally.addTallyResults({
        voteOptionIndices: [0],
        tallyResults: [TALLY_RESULTS.tally[0]],
        tallyResultProofs: [invalidProof],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        totalSpentSalt: TOTAL_SPENT_VOICE_CREDITS.salt,
        tallyResultSalt: TALLY_RESULTS.salt,
        newResultsCommitment: TALLY_RESULTS.commitment,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      }),
    ).to.be.revertedWithCustomError(tally, "TooManyResults");
  });

  it("should not allow to calculate alpha funds if there are not enough funds", async () => {
    await expect(tally.calculateAlpha(0n)).to.be.revertedWithCustomError(tally, "InvalidBudget");
  });

  it("should not claim funds for the project if proof generation is failed", async () => {
    const voteOptionTreeDepth = 3;
    const invalidProof = [
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
    ];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: TALLY_RESULTS.tally[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof: invalidProof,
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      await expect(tally.claim(params)).to.be.revertedWithCustomError(tally, "InvalidTallyVotesProof");
    }
  });

  it("should calculate alpha if not already set", async () => {
    const alphaBefore = await tally.alpha();
    const voiceCreditsPerOptions = PER_VO_SPENT_VOICE_CREDITS.tally.map((x) => BigInt(x));

    // calculate alpha manually based on Tally.sol
    const totalSpent = await tally.totalSpent();
    const voiceCreditFactor = await tally.voiceCreditFactor();
    const totalAmount = await tally.totalAmount();
    const ALPHA_PRECISION = 10n ** 18n;
    const totalVotesSquares = await tally.totalVotesSquares();
    const contributions = totalSpent * voiceCreditFactor;
    const expectedAlpha =
      ((totalAmount - contributions) * ALPHA_PRECISION) / (voiceCreditFactor * (totalVotesSquares - totalSpent));

    await tally.getAllocatedAmounts(voiceCreditsPerOptions);
    const alphaAfter = await tally.alpha();

    expect(alphaBefore).to.equal(0n);
    expect(alphaAfter).to.equal(expectedAlpha);
  });

  it("should calculate rewards per project", async () => {
    const voiceCreditsPerOptions = PER_VO_SPENT_VOICE_CREDITS.tally.map((x) => BigInt(x));

    const expectedRewards = [
      9012413244165830783n,
      1552310421321149129846n,
      3456104942999765660263n,
      606317844329397788254n,
      83908671708440493505n,
      114053640482546893023n,
      339053188661031771904n,
      32631150239393525252n,
      1763946736951215707909n,
      3425959975385659260745n,
      544474046722880535633n,
      465226967954353402878n,
      0n,
    ];

    await tally.getAllocatedAmounts(voiceCreditsPerOptions);
    const amounts = await tally.getAllocatedAmounts.staticCall(voiceCreditsPerOptions);

    for (let index = 0; index < amounts.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const amount = await tally.getAllocatedAmount(index, voiceCreditsPerOptions[index]);

      expect(amounts[index].toString()).to.equal(amount.toString());
      expect(amount).to.equal(expectedRewards[index]);
    }
  });

  it("should claim funds properly for the project", async () => {
    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const tallyResultProof = tallyResultProofs[index];

      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: tallyResults[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof,
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth: treeDepths.voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      const promise = await tally.claim(params);
      // eslint-disable-next-line no-await-in-loop
      const receipt = await promise.wait();
      // eslint-disable-next-line no-await-in-loop
      const amount = await tally.getAllocatedAmount(params.index, params.voiceCreditsPerOption);

      expect(receipt?.status).to.equal(1);
      // eslint-disable-next-line no-await-in-loop
      await expect(promise).to.emit(tally, "Claimed").withArgs(index, projectAddress, amount);
    }
  });

  it("should not claim funds for the project if funds are already claimed", async () => {
    const tallyResults = TALLY_RESULTS.tally.map((x) => BigInt(x));
    const tallyResultProofs = TALLY_RESULTS.tally.map((_, index) =>
      genTreeProof(index, tallyResults, Number(treeDepths.voteOptionTreeDepth)),
    );

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < TALLY_RESULTS.tally.length; index += 1) {
      const params = {
        index,
        voiceCreditsPerOption: PER_VO_SPENT_VOICE_CREDITS.tally[index],
        tallyResult: TALLY_RESULTS.tally[index],
        totalSpent: TOTAL_SPENT_VOICE_CREDITS.spent,
        tallyResultProof: tallyResultProofs[index],
        tallyResultSalt: TALLY_RESULTS.salt,
        voteOptionTreeDepth: treeDepths.voteOptionTreeDepth,
        spentVoiceCreditsHash: TOTAL_SPENT_VOICE_CREDITS.commitment,
        perVOSpentVoiceCreditsHash: PER_VO_SPENT_VOICE_CREDITS.commitment,
      };

      // eslint-disable-next-line no-await-in-loop
      await expect(tally.claim(params)).to.be.revertedWithCustomError(tally, "AlreadyClaimed");
    }
  });

  it("should withdraw to custodian after cooldownTime properly", async () => {
    await timeTravel(1, owner);

    const [contractBalance, initialCustodianBalance, totalAmount] = await Promise.all([
      payoutToken.balanceOf(tally),
      payoutToken.balanceOf(custodian),
      tally.totalAmount(),
    ]);

    const tx = await tally.withdraw();
    await tx.wait();

    const [balance, custodianBalance, totalExtraFunds] = await Promise.all([
      payoutToken.balanceOf(tally),
      payoutToken.balanceOf(custodian),
      tally.totalAmount(),
    ]);

    expect(balance).to.equal(0n);
    expect(totalExtraFunds).to.equal(0n);
    expect(initialCustodianBalance + totalAmount).to.equal(custodianBalance);
    expect(contractBalance).to.equal(totalAmount);
  });
});
