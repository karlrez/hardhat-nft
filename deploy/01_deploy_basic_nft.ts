import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../helper-functions"
import { uploadFiles, uploadMetaData } from "../utils/pinataUpload"
import dotenv from "dotenv"

dotenv.config()

const UPLOAD_IPFS = process.env.UPLOAD_IPFS
const UPLOAD_IMAGE_METADATA = process.env.UPLOAD_IMAGE_METADATA

const deployBasicNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // const { deployments, getNamedAccounts, network, ethers } = hre
    // const { deploy, log } = deployments
    // const { deployer } = await getNamedAccounts()
    // const waitBlockConfirmations = developmentChains.includes(network.name)
    //     ? 1
    //     : VERIFICATION_BLOCK_CONFIRMATIONS

    // log("----------------------------------------------------")
    // const args: any[] = [deployer]
    // const basicNft = await deploy("BasicNft", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: waitBlockConfirmations || 1,
    // })

    // // Verify the deployment
    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("Verifying...")
    //     await verify(basicNft.address, args)
    // }

    // upload images in /images folder to ipfs
    let uploadedFiles = null
    if (UPLOAD_IPFS === "true") {
        console.log("uploading images to ipfs-----------------")
        uploadedFiles = await uploadFiles()
    }

    // deploy metadata to images we hosted on ipfs
    if (UPLOAD_IMAGE_METADATA === "true") {
        console.log("uploading image metadata--------------------")
        if (uploadedFiles) {
            await uploadMetaData(uploadedFiles)
        } else {
            console.log("no uploaded files to add metadata")
        }
    }

    // mint nfts
}

export default deployBasicNft
deployBasicNft.tags = ["all", "basicnft", "main"]
