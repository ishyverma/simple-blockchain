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
    ws: WebSocket
}

export const proofOfWork = (blockNumber: number, data: string, prevHash: string) => {
    let nonce = 1
    while (true) {
        const hash = crypto.createHash("sha256").update(`${blockNumber}${data}${prevHash}${nonce}`).digest("hex")
        if (hash.startsWith("0000")) {
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

export let BLOCKCHAIN: BlockchainType[] = []
export let MINERS: MinerType[] = []