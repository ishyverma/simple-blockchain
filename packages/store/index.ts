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
            console.log(hash)
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

export const verifyPow = (nonce: string, blockNumber: string, data: string, hash: string) => {
    const previousHash = BLOCKCHAIN.slice(-1)[0].prevHash ?? "0".repeat(64)
    if (hash.startsWith("0000")) {
        const verifyHash = crypto.createHash("sha256").update(`${blockNumber}${data}${previousHash}${nonce}`).digest("hex")
        if (verifyHash === hash) {
            return true
        }
    }
    return false
}

export let BLOCKCHAIN: BlockchainType[] = []
export let MINERS: MinerType[] = []