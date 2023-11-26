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
const outputDirectory = "./scripts/"

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

const uploadFiles = async () => {
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
        }
        // create json file of the responses
        const outputFile = path.join(outputDirectory, "uploadResponses.json")
        fs.writeFileSync(outputFile, JSON.stringify(responses))
    } catch (err) {
        console.error("Error reading directory:", err)
    }
}

uploadFiles()
