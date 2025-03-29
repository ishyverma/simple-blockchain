import axios from "axios";
import React, { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";

type Props = {
  userId: string;
  sendMessage: (event: any) => void;
};

interface User {
  username: string;
  id: string;
  balance: number;
}

const UserCard = ({ userId, sendMessage }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User>();
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const getUsers = async () => {
      const response = await axios.get("/api/user");
      setUsers(response.data.users);
    };
    getUsers();
  }, []);

  return (
    <>
      <div className="mt-5">
        {users
          .filter((user) => user.id !== userId)
          .map((user) => (
            <div
              onClick={() => {
                setSelected(user)
              }}
              key={user.id}
              className="flex items-center justify-between border p-3 rounded-lg px-5 cursor-pointer hover:shadow hover:bg-neutral-900 transition-all"
            >
              <div className="flex items-center justify-center gap-4">
                <p className="bg-[#455964] text-white py-1 px-3 rounded-full text-lg">
                  {user.username[0].toUpperCase()}
                </p>
                <p className="tracking-tight font-medium">@{user.username}</p>
              </div>
              <div className="text-lg tracking-tighter font-semibold">
                $ {user.balance}
              </div>
            </div>
          ))}
      </div>
      {!selected ? (
        <div className="border p-5 rounded-lg mt-5">
          <h1 className="text-3xl tracking-tighter font-semibold">
            Transfer Details
          </h1>
          <div className="flex items-center justify-center text-2xl tracking-tighter text-neutral-500 gap-3">
            <p>Select a recipent to start the transfer</p>
            <ArrowRight className="w-10 h-10 border-2 rounded-full p-1" />
          </div>
        </div>
      ) : (
        <div className="border p-5 rounded-lg mt-5">
          <h1 className="text-3xl tracking-tighter font-semibold">
            Transfer Details
          </h1>
          <div className="p-4 flex gap-3 items-center">
            <p className="bg-[#455964] text-white py-2 px-4 rounded-full text-2xl">
              {selected.username[0].toUpperCase()}
            </p>
            <div>
                <p className="text-lg tracking-tighter font-medium">{selected.username}</p>
                <p className="text-sm tracking-tight font-medium">Balance: $ {selected.balance}</p>
            </div>
          </div>
          <div className="px-4 py-2 space-y-3">
            <Label htmlFor="amount">Amount to Transfer</Label>
            <Input onChange={(e) => setAmount(e.target.value)} type="number" id="amount" placeholder="$ 0.00" className="h-12" />
            <Button onClick={() => {
                console.log("get here")
                sendMessage({
                    type: "send_money",
                    payload: {
                        from: userId,
                        to: selected.id,
                        amount: parseInt(amount)
                    }
                })
                console.log('gret here too')
            }} className="cursor-pointer">
                Send Money
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserCard;
