import React from 'react'

type Props = {
    sendMessage: (event: any) => void;
    data: string;
}

interface MineType {
    type: string,
    payload: {
        from: string,
        to: string,
        amount: number,
        previousHash: string,
        id: string
    }
}

const MinerCard = ({ sendMessage, data }: Props) => {
    if ((JSON.parse(data) as unknown as MineType).type === 'mine') {
        sendMessage(JSON.parse(data))
    }

  return (
    <div>{data}</div>
  )
}

export default MinerCard