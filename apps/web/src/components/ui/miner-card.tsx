import React, { useEffect, useState } from 'react'

type Props = {
    sendMessage: (event: any) => void;
    data: string;
    ws: WebSocket | null;
    id: string;
}

import { BLOCKCHAIN, proofOfWork, verifyPow } from "@repo/store/utils";

interface MineType {
    type: string,
    payload: {
        from: string,
        to: string,
        amount: number,
        previousHash: string,
        id: number
    }
}

interface DataProps {
    id: number;
    nonce: string;
    data: string;
    prevHash: string;
    currentHash: string;
}

interface MessageType {
    type: string;
    payload: {
      BLOCKCHAIN: DataProps[]
    }
}


const MinerCard = ({ sendMessage, data: messageFromServer, ws, id: minerId }: Props) => {
    
    useEffect(() => {
        if (messageFromServer) {
            if ((JSON.parse(messageFromServer) as unknown as MineType).type === 'mine') {
                const { payload: { id, amount, from, previousHash, to } } = JSON.parse(messageFromServer) as unknown as MineType
                const startTime = new Date().getTime()
                const { blockNumber, data, nonce, currentHash } = proofOfWork(id, `${from}-${to} | Rs. ${amount}`, previousHash)
                const endTime = new Date().getTime()
                sendMessage({
                    type: "done_mine",
                    payload: {
                        timeTaken: endTime - startTime,
                        id: minerId,
                        blockNumber,
                        nonce,
                        currentHash,
                        from,
                        to,
                        previousHash,
                        amount
                    }
                })
            }
            if ((JSON.parse(messageFromServer) as MineType).type === 'verify') {
                const { payload: { id, blockNumber, nonce, currentHash, previousHash, amount, from, to } } = JSON.parse(messageFromServer)
                const verifiedHash = verifyPow(nonce, blockNumber, `${from}-${to} | Rs. ${amount}`, currentHash, previousHash)
                sendMessage({
                    type: "add_to_blockchain",
                    payload: {
                        add: verifiedHash,
                        blockNumber,
                        nonce,
                        data: `${from}-${to} | Rs. ${amount}`,
                        previousHash,
                        currentHash
                    }
                })
            }
        }
    }, [messageFromServer])

  return (
    <div>{messageFromServer}</div>
  )
}

export default MinerCard