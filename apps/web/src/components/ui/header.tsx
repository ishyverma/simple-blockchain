import React, { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./button";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "./badge";

type Props = {
  userId: string;
  isConnected: boolean;
};

const Header = ({ userId, isConnected }: Props) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      try {
        const response = await axios.post("/api/balance", {
          userId,
        });
        setBalance(response.data.balance);
      } catch (error) {
        console.log("GETBALANCE_ERROR", error);
        toast.error("There was some error");
      }
    };
    getBalance();
  }, []);

  const updateBalance = async () => {
    try {
      const response = await axios.put("/api/balance", {
        userId,
        balance: 100
      })
      setBalance(response.data.balance)
    } catch (error) {
      console.log("UPDATEBALANCE_ERROR", error);
      toast.error("There was some error");
    }
  }

  return (
    <div className="flex items-center justify-between border-b-2 pb-4 px-20 py-4">
      <div className="text-3xl font-bold tracking-tighter">Blockchain</div>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={updateBalance} size="sm" className="cursor-pointer">
          Add Money
        </Button>
        <ModeToggle />
        <p className="text-2xl font-semibold tracking-tighter">
          Balance: $ {balance}
        </p>
        {isConnected ? <Badge className="bg-green-300 border border-green-500 text-black" variant="outline">Connected</Badge> : <Badge className="bg-red-300 border border-red-500 text-black" variant="outline">Not Connected</Badge>}
      </div>
    </div>
  );
};

export default Header;
