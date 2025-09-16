import hre from "hardhat";

interface CliArgs {
  name?: string;
  symbol?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if ((current === "--name" || current === "-n") && next) {
      args.name = next;
      i += 1;
      continue;
    }
    if ((current === "--symbol" || current === "-s") && next) {
      args.symbol = next;
      i += 1;
      continue;
    }
  }
  return args;
}

async function main(): Promise<void> {
  const { ethers, network } = hre;

  const { name, symbol } = parseArgs(process.argv.slice(2));

  const tokenName = name || process.env.MOCK_ERC20_NAME || "Mock Token";
  const tokenSymbol = symbol || process.env.MOCK_ERC20_SYMBOL || "MOCK";

  const [deployer] = await ethers.getSigners();

  console.log(`Deploying MockERC20 to network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Name: ${tokenName} | Symbol: ${tokenSymbol}`);

  const factory = await ethers.getContractFactory("MockERC20", deployer);
  const contract = await factory.deploy(tokenName, tokenSymbol);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const txHash = (contract.deploymentTransaction() || { hash: "" }).hash;

  console.log("MockERC20 deployed!");
  console.log(`Address: ${address}`);
  if (txHash) {
    console.log(`Tx: ${txHash}`);
  }

  // Tip: To verify (if supported), run:
  //   npx hardhat verify --network <network> <address> "${tokenName}" "${tokenSymbol}"
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
