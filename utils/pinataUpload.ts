import axios from "axios"
import FormData from "form-data"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

interface PinataResponse {
    IpfsHash: string
    PinSize: number
    Timestamp: string
}

interface PinataResponses {
    [key: string]: PinataResponse
}

const JWT = process.env.PINATA_JWT
const directoryPath = "./images/"
const outputDirectory = "./utils/"
const METADATA_TEMPLATE = {
    name: "Name of NFT",
    description: "Description of NFT",
    external_url: "https://pinata.cloud",
    image: "ipfs://CID_GOES_HERE",
}

const pinFileToIPFS = async (fileName: string) => {
    const formData = new FormData()
    const src = directoryPath + fileName

    const file = fs.createReadStream(src)
    formData.append("file", file)

    const pinataMetadata = JSON.stringify({
        name: fileName,
    })
    formData.append("pinataMetadata", pinataMetadata)

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    })
    formData.append("pinataOptions", pinataOptions)

    // @ts-ignore: Ignore TypeScript checking for _boundary
    const boundary = (formData as any)._boundary

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                Authorization: JWT,
            },
        })
        return { res: res.data }
    } catch (error) {
        return { error: error }
    }
}

export const uploadFiles = async () => {
    let responses: PinataResponses = {}
    try {
        // read in files from image directory
        const files = fs.readdirSync(directoryPath)
        for (const fileName of files) {
            // upload each file individually then save response to a file if successful
            console.log(`uploading ${fileName} ----------------------------------------`)
            const { error, res } = await pinFileToIPFS(fileName)
            if (error) {
                console.log(JSON.stringify(error))
                break
            } else {
                responses[fileName] = res
            }

            // Create the output directory if it doesn't exist
            if (!fs.existsSync(outputDirectory)) {
                fs.mkdirSync(outputDirectory, { recursive: true })
            }
        }
        // create json file of the responses
        const outputFile = path.join(outputDirectory, "uploadResponses.json")
        fs.writeFileSync(outputFile, JSON.stringify(responses))

        return responses
    } catch (err) {
        console.error("Error reading directory:", err)
    }
}

export const uploadMetaData = async (files: PinataResponses) => {
    for (const [key, value] of Object.entries(files)) {
        const nftName = key.slice(0, key.lastIndexOf("."))
        const data = JSON.stringify({
            pinataContent: {
                name: `${nftName} NFT`,
                description: `A cool NFT of a ${nftName} martian`,
                external_url: "https://pinata.cloud",
                image: `ipfs://${value.IpfsHash}`,
            },
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
        } catch (error) {
            console.log(error)
        }
    }
}
