import { assert, expect } from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { BasicNft } from "../../typechain"

const EXAMPLE_METADATA = {
    boy: {
        name: "boy NFT",
        description: "A cool NFT of a boy martian",
        external_url: "https://pinata.cloud",
        image: "ipfs://QmU5cC3kZKhxyTfN8UPEarV5E4We7PcNBT3X2nFCXj3949",
    },
}

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Tests", function () {
          let basicNft: BasicNft
          let deployer: string
          let tokenUri = EXAMPLE_METADATA.boy.image

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0].address
              await deployments.fixture(["mocks", "basicnft"])
              basicNft = await ethers.getContract("BasicNft")
          })

          it("Allows users to mint an NFT", async function () {
              const txResponse = await basicNft.safeMint(deployer, tokenUri)
              await txResponse.wait(1)
              const tokenURI = await basicNft.tokenURI(0)
              assert.equal(tokenURI, await basicNft.tokenURI(0))
          })
      })
