'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWebsocket } from '@/hooks/useWebsocket'
import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react'

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

type Props = {}

const Blockchain = (props: Props) => {
  const { data, error, isConnected, sendMessage, ws } = useWebsocket("ws://localhost:8080")
  const [message, setMessage] = useState<DataProps[]>([])

  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: "join_blockchain"
      })
    }
  }, [isConnected])

  useEffect(() => {
    if (data) {
      if((JSON.parse(data) as MessageType).type === 'send_blockchain') {
        setMessage((JSON.parse(data) as MessageType).payload.BLOCKCHAIN)
      }
    }
  }, [data])

  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: "get_blockchain"
      })
    }
  }, [data, isConnected])

  return (
    <div className='grid grid-cols-3 gap-2 p-10'>
      {message.map((block, index) => (
        <Card key={index} className='w-[450px]'>
          <CardContent className='space-y-3'>
            <div className='flex items-center gap-6 relative'>
              <Label>Block:</Label>
              <div className='absolute bg-neutral-600 left-[70px] rounded-l h-[34px] flex items-center justify-center w-[34px] opacity-100 border'>#</div>
              <Input value={block.id} className='px-12 disabled:text-white' readOnly></Input>
            </div>
            <div className='flex items-center gap-[18px]'>
              <Label>Nonce:</Label>
              <Input value={block.nonce} className='px-3' readOnly></Input>
            </div>
            <div className='flex items-center gap-8'>
              <Label>Data:</Label>
              <Textarea value={block.data} className='px-3' readOnly></Textarea>
            </div>
            <div className='flex items-center gap-9'>
              <Label>Prev:</Label>
              <Input value={block.prevHash} className='px-3 overflow-auto' readOnly></Input>
            </div>
            <div className='flex items-center gap-8'>
              <Label>Hash:</Label>
              <Input value={block.currentHash} className='px-3' readOnly></Input>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default Blockchain