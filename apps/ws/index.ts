import prisma from "@repo/db/client";
import { BLOCKCHAIN, MINERS, proofOfWork } from "@repo/store/utils";
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 })

let id = 1;

wss.on("connection", ws => {
    ws.on("message", data => {
        const message = JSON.parse(data.toString())
        switch (message.type) {
            case "send_money": {
                const from = message.payload.from // Id of the user who is sending money
                const to = message.payload.to  // Id of the user who is recieving money
                const amount = message.payload.amount

                // Add this 64 times 0 if there is no block in the blockchain for the first time and after that take the last hash from the blockchain
                const previousHash = message.payload.previousHash

                MINERS.map(miner => miner.ws.send(JSON.stringify({
                    type: "mine",
                    payload: {
                        from,
                        to,
                        amount,
                        previousHash
                    }
                })))
                const promiseUser = prisma.user.findUnique({
                    where: {
                        id: from
                    }
                })
                promiseUser.then(response => {
                    if (!response) {
                        ws.send("There is no such user")
                        return
                    }
                    if (response.balance < amount) {
                        ws.send("Not enough balance")
                    }
                })
                break;
            }
            // If miner wants to mine
            case "join_mine": {
                MINERS.push({
                    id: message.payload.id,
                    ws
                })
                ws.send("Ready to mine")
                break;
            }
            case "left_mine": {
                const id = message.payload.id
                MINERS.filter(miner => miner.id !== id)
                ws.send("Mining stopped")
                break;
            }
            // If miner is connected to the mine and want to mine
            case "mine": {
                const from = message.payload.from
                const to = message.payload.to
                const amount = message.payload.amount
                const previousHash = message.payload.prevHash

                const { blockNumber, data, nonce, prevHash, currentHash } = proofOfWork(id, `${from}-${to} | Rs. ${amount}`, previousHash)

                BLOCKCHAIN.push({
                    currentHash,
                    data,
                    id,
                    nonce: nonce,
                    prevHash
                })

                // Sending user the data that he has mined
                ws.send(JSON.stringify({
                    blockNumber,
                    data,
                    nonce,
                    prevHash,
                    currentHash
                }))

                break;
            }
            case "change_blockchain": {
                const messageData = message.payload.data
                const id = message.payload.id
                const previousHash = message.payload.previousHash

                const { blockNumber, data, nonce, prevHash, currentHash } = proofOfWork(id, messageData, previousHash)

                break;
            }

            case "verify_hash": {

            }
        }
    })
})

wss.on("close", (ws: WebSocket) => {
    MINERS.filter(miner => miner.ws !== ws)
    ws.send("Disconnected From MINE")
})  