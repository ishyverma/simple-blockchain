import prisma from "@repo/db/client";
import { BLOCKCHAIN, MINERS, proofOfWork, verifyPow } from "@repo/store/utils";
import WebSocket, { WebSocketServer } from "ws";

interface POWType {
  timeTaken: number;
  id: string;
}

const wss = new WebSocketServer({ port: 8080 });

let num = 1;
export let POW: POWType[] = [];
export let ADD: boolean[] = [];
export let GET_BLOCKS: WebSocket[] = [];

wss.on("connection", (ws) => {
  console.log("connected");
  ws.send(JSON.stringify({ type: "connected" }));
  ws.on("message", async (data) => {
    const message = JSON.parse(data.toString());
    switch (message.type) {
      case "send_money": {
        const from = message.payload.from; // Id of the user who is sending money
        const to = message.payload.to; // Id of the user who is recieving money
        const amount = message.payload.amount;
        console.log(from, to, amount);
        // Add this 64 times 0 if there is no block in the blockchain for the first time and after that take the last hash from the blockchain
        const previousHash = BLOCKCHAIN.length
          ? BLOCKCHAIN[BLOCKCHAIN.length - 1].currentHash
          : "0".repeat(64);
        const prevId = BLOCKCHAIN.length
          ? BLOCKCHAIN[BLOCKCHAIN.length - 1].id + 1
          : 1;

        try {
          const promiseUser = await prisma.user.findUnique({
            where: {
              id: from,
            },
          });

          if (!promiseUser) {
            ws.send("There is no such user");
            return;
          }

          if (promiseUser.balance < amount) {
            ws.send("Not enough balance");
            return;
          }
        } catch (error) {
          console.log("SEND_MONEY", error);
        }
        MINERS.map((miner) =>
          miner.ws.send(
            JSON.stringify({
              type: "mine",
              payload: {
                from,
                to,
                amount,
                previousHash,
                id: prevId,
              },
            })
          )
        );
        break;
      }
      // If miner wants to mine
      case "join_mine": {
        const miners = MINERS.filter((miner) => miner.ws === ws);
        MINERS.push({
          id: message.payload.id,
          ws,
          blockChainCopy: BLOCKCHAIN,
        });
        console.log(MINERS);
        ws.send(
          JSON.stringify({
            type: "ready to mine",
          })
        );
        break;
      }
      case "left_mine": {
        const id = message.payload.id;
        const miner = MINERS.findIndex((miner) => miner.ws === ws);
        if (miner === -1) {
          ws.send("There is no such miner");
          return;
        }

        MINERS.splice(miner, 1);
        ws.send("Mining stopped");
        break;
      }
      // If miner is connected to the mine and want to mine
      // case "mine": {
      //     const from = message.payload.from
      //     const to = message.payload.to
      //     const amount = message.payload.amount
      //     const previousHash = message.payload.previousHash
      //     const id = message.payload.id
      //     const { blockNumber, data, nonce, currentHash } = proofOfWork(id, `${from}-${to} | Rs. ${amount}`, previousHash)

      //     BLOCKCHAIN.push({
      //         currentHash,
      //         data,
      //         id,
      //         nonce: nonce,
      //         prevHash: previousHash
      //     })
      //     console.log("BLOCKCHAIN", BLOCKCHAIN)
      //     // Sending user the data that he has mined
      //     ws.send(JSON.stringify({
      //         blockNumber,
      //         data,
      //         nonce,
      //         prevHash: previousHash,
      //         currentHash,
      //         minerId: id
      //     }))

      //     break;
      // }
      case "change_blockchain": {
        const messageData = message.payload.data;
        const id = message.payload.id;
        const previousHash = message.payload.previousHash;

        const { blockNumber, data, nonce, prevHash, currentHash } = proofOfWork(
          id,
          messageData,
          previousHash
        );

        break;
      }

      case "done_mine": {
        const timeTaken = message.payload.timeTaken;
        const blockNumber = message.payload.blockNumber;
        const nonce = message.payload.nonce;
        const currentHash = message.payload.currentHash;
        const previousHash = message.payload.previousHash;
        const amount = message.payload.amount;
        const id = message.payload.id;
        const from = message.payload.from;
        const to = message.payload.to;
        POW.push({
          timeTaken,
          id: id,
        });
        let lowerTime = POW[0];
        if (MINERS.length === POW.length) {
          console.log("POW", POW);
          POW.map((miner) => {
            if (miner.timeTaken < lowerTime.timeTaken) {
              lowerTime = miner;
            }
          });
          MINERS.filter((miner) => miner.id !== lowerTime.id).map((miner) =>
            miner.ws.send(
              JSON.stringify({
                type: "verify",
                payload: {
                  id: lowerTime.id,
                  blockNumber,
                  nonce,
                  currentHash,
                  previousHash,
                  amount,
                  from,
                  to,
                },
              })
            )
          );
          POW = [];
        }
        break;
      }

      case "verify_hash": {
        const hash = message.payload.hash;
        const nonce = message.payload.nonce;
        const data = message.payload.data;
        const blockId = message.payload.blockId;

        const verify = verifyPow(nonce, blockId, data, hash, "");

        if (verify) {
          ws.send("Verified HASH");
        }

        const miner = MINERS.find((miner) => miner.ws === ws);

        if (!miner) {
          ws.send("Miners not found");
          return;
        }

        const userId = miner.id;

        try {
          const miner = await prisma.miner.update({
            where: {
              id: userId,
            },
            data: {
              balance: {
                increment: 100,
              },
            },
          });
          if (!miner) {
            ws.send("There is no such miner");
            return;
          } else {
            ws.send("100 Rs. creadited to your account");
          }
        } catch (error) {}

        BLOCKCHAIN.push({
          currentHash: hash,
          data,
          id: num, // Block Id
          nonce,
          prevHash: BLOCKCHAIN.length
            ? BLOCKCHAIN[BLOCKCHAIN.length - 1].prevHash
            : "0".repeat(64),
        });

        MINERS.map((miner) => {
          if (miner.ws !== ws) {
            miner.blockChainCopy.push({
              currentHash: hash,
              data,
              id: num,
              nonce,
              prevHash: BLOCKCHAIN.length
                ? BLOCKCHAIN[BLOCKCHAIN.length - 1].prevHash
                : "0".repeat(64),
            });
          }
        });

        num += 1;
        break;
      }

      case "join_blockchain": {
        GET_BLOCKS.push(ws);
        ws.send(JSON.stringify({
          type: "joined_blockchain"
        }))
        break;
      }

      case "get_blockchain": {
        GET_BLOCKS.map((block) =>
          block.send(
            JSON.stringify({
              type: "send_blockchain",
              payload: {
                BLOCKCHAIN,
              },
            })
          )
        );
        break;
      }

      case "add_to_blockchain": {
        ADD.push(message.payload.add);
        if (ADD.length === MINERS.length - 1) {
          if (ADD.includes(false)) {
            ws.send(
              JSON.stringify({
                type: "not_added",
              })
            );
          } else {
            BLOCKCHAIN.push({
              id: message.payload.blockNumber,
              currentHash: message.payload.currentHash,
              data: message.payload.data,
              nonce: message.payload.nonce,
              prevHash: message.payload.previousHash,
            });
            console.log(BLOCKCHAIN);
            GET_BLOCKS.map(block => block.send(JSON.stringify({
              ype: "send_blockchain",
                payload: {
                  id: message.payload.blockNumber,
                  currentHash: message.payload.currentHash,
                  data: message.payload.data,
                  nonce: message.payload.nonce,
                  prevHash: message.payload.previousHash,
                },
            })))
            ws.send(JSON.stringify({
              type: "added"
            }))
            ADD = [];
          }
        }
        break;
      }
    }
  });
});

wss.on("close", (ws: WebSocket) => {
  const miner = MINERS.findIndex((miner) => miner.ws === ws);

  if (miner === -1) {
    ws.send("There is no such miner");
    return;
  }

  MINERS.splice(miner, 1);
});
