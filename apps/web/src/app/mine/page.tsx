'use client';

import MinerCard from "@/components/ui/miner-card";
import { useWebsocket } from "@/hooks/useWebsocket";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const Mine = () => {
    const { data: session } = useSession()
    console.log(session)
    const { data, error, isConnected, sendMessage, ws } = useWebsocket("https://simple-blockchain-o3o4.onrender.com/")
    console.log(ws)
    const connected = useRef(false)

    useEffect(() => {
        if(isConnected && session?.user.id) {
            console.log(session.user.id)
            sendMessage?.({
                type: "join_mine",
                payload: {
                    id: session?.user.id,
                }
            })
        }
    }, [isConnected, session?.user.id])

    if (!session || !ws) {
        return null;
    }

    return (  
        <div>
            <MinerCard ws={ws} sendMessage={sendMessage} data={data} id={session.user.id} />
        </div>
    );
}
 
export default Mine;