import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../helper-functions"
import dotenv from "dotenv"

dotenv.config()

const UPLOAD_IPFS = process.env.UPLOAD_IPFS
const UPLOAD_IMAGE_METADATA = process.env.UPLOAD_IMAGE_METADATA

const deployNftMarketPlace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const args: any[] = []
    // make sure this matches the name in ./artifacts
    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations || 1,
        gasLimit: 5000000,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(nftMarketplace.address, args)
    }
}

export default deployNftMarketPlace
deployNftMarketPlace.tags = ["all", "nftmarketplace", "main"]
