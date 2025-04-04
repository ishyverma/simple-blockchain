'use client';

import Header from "@/components/ui/header";
import UserCard from "@/components/ui/user-card";
import { useWebsocket } from "@/hooks/useWebsocket";
import { useSession } from "next-auth/react";

const User = () => {
    const { data: session } = useSession();
    const { isConnected, sendMessage, data, error } = useWebsocket("https://simple-blockchain-o3o4.onrender.com/")

    if(!session) {
        return null
    }

    return (  
        <div className="">
            <Header isConnected={isConnected} userId={session.user.id} />
            <div className="px-20 py-4">
                <h1 className="text-4xl tracking-tighter font-bold">Send money to your friend :</h1>
                <UserCard sendMessage={sendMessage} userId={session.user.id} />
            </div>
        </div>
    );
}
 
export default User;