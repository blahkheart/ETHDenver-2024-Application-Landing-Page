// import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { getContract } from "wagmi/actions";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { useEthersProvider } from "~~/utils/ethers";


const Home: NextPage = () => {
  const { address } = useAccount();
  const provider = useEthersProvider();
  const publicClient = usePublicClient();
  const config = useScaffoldConfig();
  const [sporkBalance, setSporkBalance] = useState(0);
  const [sSporkBalance, setSSporkBalance] = useState(0);
  const [bbbBalance, setBbbBalance] = useState(0);
  useEffect(() => {
    // Fetch vote token balance when wallet address changes
    const fetchBalance = async () => {
      try {
        if (!address) return 0;
        // contract ABI
        const ABI = [
          // Read-Only Functions
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",

          // Authenticated Functions
          "function transfer(address to, uint amount) returns (bool)",

          // Events
          "event Transfer(address indexed from, address indexed to, uint amount)",
        ];
        // Token addresses
        const SPORKTokenMATIC = "0x9CA6a77C8B38159fd2dA9Bd25bc3E259C33F5E39";
        const SPORKTokenMainnet = "0xb624fde1a972b1c89ec1dad691442d5e8e891469";
        const sSPORKToken = "0x058d96BAa6f9D16853970b333ed993aCC0c35aDd";
        const BBBToken = "0x4200000000000000000000000000000000000042";
        // create token contract intance
        const diamondCut = getContract({
          address: sSPORKToken,
          abi: ["function balanceOf(address account) view returns (uint256)"],
          walletClient: publicClient,
        });
        const SPORKTokenContract = new ethers.Contract(
          // config.configuredNetwork.id === 1 ? SPORKTokenMainnet : SPORKTokenMATIC, 
          SPORKTokenMATIC,
          ABI,
          provider,
        );
        const sSPORKTokenContract = new ethers.Contract(sSPORKToken, ABI, provider);
        const BBBTokenContract = new ethers.Contract(BBBToken, ABI, provider);
        console.log("contract:", diamondCut);
        // const x = await diamondCut.read.balanceOf(address);

        // Fetch balances for the connected wallet address
        const SPORKBalance = await SPORKTokenContract.balanceOf(address);
        const SPORK = await SPORKTokenContract.symbol();
        console.log("contractXX:", Number(ethers.formatEther(SPORKBalance)));
        console.log("contXX:", SPORK);
        
        // const sSPORKBalance = await sSPORKTokenContract.balanceOf(address);
        // const BBBBalance = await BBBTokenContract.balanceOf(address);
        // setSporkBalance(Number(ethers.formatEther(SPORKBalance)));
        // setSSporkBalance(Number(ethers.formatEther(sSPORKBalance)));
        // setBbbBalance(Number(ethers.formatEther(BBBBalance)));
      } catch (e) {
        console.log("ERR_FETCHING_VOTING_BALANCE:", e);
      }
    };
    fetchBalance();
  }, [address, provider, config]);

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">ETH Denver 2024</span>
          </h1>
          <div className="balances flex">
            <div className="flex">
              <span>SPORK</span> {sporkBalance}
            </div>
            <div className="flex">
              <span>sSPORK</span> {sSporkBalance}
            </div>
            <div className="flex">
              <span>BBB</span> {bbbBalance}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;