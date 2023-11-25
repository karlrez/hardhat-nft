/*
    File: uploadToPinata.ts
    Description: This script will loop through all the images in the ./images folder and upload the files to ipfs using Pinata.
*/

import axios from "axios"
import FormData from "form-data"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const JWT = process.env.PINATA_JWT
const directoryPath = "./images/"
const outputDirectory = "./scripts/uploadToPinataResult/"

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
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true })
    }

    // read in files from image directory
    fs.readdir(directoryPath, async (err, files) => {
        if (err) {
            console.error("Error reading directory:", err)
            return
        }

        // upload each file individually then save response to a file if successful
        for (const fileName of files) {
            console.log(`uploading ${fileName} ----------------------------------------`)
            const { error, res } = await pinFileToIPFS(fileName)
            if (error) {
                console.log(JSON.stringify(error))
                break
            } else {
                const outputFile = path.join(outputDirectory, `${fileName}_response.txt`)
                fs.writeFileSync(outputFile, JSON.stringify(res))
            }
        }
    })
}

uploadFiles()
