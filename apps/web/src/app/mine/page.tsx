'use client';

import MinerCard from "@/components/ui/miner-card";
import { useWebsocket } from "@/hooks/useWebsocket";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const Mine = () => {
    const { data: session } = useSession()
    const { data, error, sendMessage, isConnected } = useWebsocket("ws://localhost:8080")

    useEffect(() => {
        if(isConnected) {
            sendMessage({
                type: "join_mine",
                payload: {
                    id: session?.user.id
                }
            })
        }
    }, [isConnected])

    if (!session) {
        return null
    }

    return (  
        <div>
            <MinerCard sendMessage={sendMessage} data={data} />
        </div>
    );
}
 
export default Mine;