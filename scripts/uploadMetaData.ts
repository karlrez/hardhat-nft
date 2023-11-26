import axios from "axios"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import metaData from "./uploadResponses.json"

dotenv.config()

interface MetaDataObj {
    name: string | undefined
    description: string | undefined
    external_url: string | undefined
    image: string | undefined
}

interface MetaData {
    [key: string]: MetaDataObj
}

const JWT = process.env.PINATA_JWT
const outputDirectory = "./scripts/"

export const uploadMetaData = async () => {
    let uploadedMetaData: MetaData = {}

    for (const [key, value] of Object.entries(metaData)) {
        const nftName = key.slice(0, key.lastIndexOf("."))
        const content = {
            name: `${nftName} NFT`,
            description: `A cool NFT of a ${nftName} martian`,
            external_url: "https://pinata.cloud",
            image: `ipfs://${value.IpfsHash}`,
        }
        const data = JSON.stringify({
            pinataContent: content,
            pinataMetadata: {
                name: `${nftName}.json`,
            },
        })

        try {
            console.log(`uploading metadata for ${key} -----------------`)
            const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: JWT,
                },
            })
            // console.log(res.data)
            uploadedMetaData[nftName] = content
        } catch (error) {
            console.log(error)
        }
    }
    // create json file of the responses
    const outputFile = path.join(outputDirectory, "imageMetaData.json")
    fs.writeFileSync(outputFile, JSON.stringify(metaData))
}

uploadMetaData()
