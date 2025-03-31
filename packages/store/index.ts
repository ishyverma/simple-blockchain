import crypto from "crypto";

import { WebSocket } from "ws";

interface BlockchainType {
    id: number;
    nonce: string;
    data: string;
    prevHash: string;
    currentHash: string;
}

interface MinerType {
    id: string;
    ws: WebSocket;
    blockChainCopy: BlockchainType[]
}

export const proofOfWork = (blockNumber: number, data: string, prevHash: string) => {
    let nonce = 1
    while (true) {
        const hash = crypto.createHash("sha256").update(`${blockNumber}${data}${prevHash}${nonce}`).digest("hex")
        if (hash.startsWith("0000")) {
            console.log('from pow', hash, prevHash)
            return {
                blockNumber,
                data,
                prevHash,
                nonce: String(nonce),
                currentHash: hash
            }
        } else {
            nonce += 1
        }
    }
}

export const verifyPow = (nonce: string, blockNumber: string, data: string, hash: string, prevHash: string) => {
    console.log("hash", hash)
    if (hash.startsWith("0000")) {
        console.log('hello', prevHash)
        const verifyHash = crypto.createHash("sha256").update(`${blockNumber}${data}${prevHash}${nonce}`).digest("hex")
        console.log(verifyHash, hash)
        if (verifyHash === hash) {
            console.log('inside the hash == verifyHash')
            return true
        }
    }
    return false
}

export let BLOCKCHAIN: BlockchainType[] = []
export let MINERS: MinerType[] = []