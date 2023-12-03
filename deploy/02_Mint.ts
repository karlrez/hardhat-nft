import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import imageMetaData from "../scripts/imageMetaData.json"

const mint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, network, ethers } = hre
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // loop thru each obj in metaData file and mint an nft for it
    let index = 0
    for (const [key, value] of Object.entries(imageMetaData)) {
        const uri = value.IpfsHash
        const basicNft = await ethers.getContract("BasicNft", deployer)
        console.log(`minting nft for ${key} -----------------------`)
        const basicMintTx = await basicNft.safeMint(deployer, uri)
        await basicMintTx.wait(1)
        console.log(`Basic NFT index ${index} tokenURI: ${await basicNft.tokenURI(0)}`)
        index++
    }
}
export default mint
mint.tags = ["all", "mint"]
