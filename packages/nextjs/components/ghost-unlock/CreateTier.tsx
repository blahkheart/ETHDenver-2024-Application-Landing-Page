// import { ChangeEvent, useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AddressInput, InputBase } from "../scaffold-eth";
import axios from "axios";
import { ethers } from "ethers";
import { useSession } from "next-auth/react";
import { useSignMessage } from "wagmi";
import { abi as publicLockABI } from "~~/abi/publicLock";
import { DefaultUserMod } from "~~/interfaces/defaultUserModifier";
import { notification } from "~~/utils/scaffold-eth";

interface Props {
  integrationId: string;
}
const NETWORKS = [
  ["Choose network", 0],
  ["Mainnet", 1],
  ["Arbitrum", 42161],
  ["Avalanche (C-Chain)", 43114],
  ["Base Goerli", 84531],
  ["BNB Chain", 56],
  ["Celo", 42220],
  ["Gnosis", 100],
  ["Goerli", 5],
  ["Mumbai", 80001],
  ["Optimism", 10],
  ["Palm", 11297108109],
  ["Polygon", 137],
];

export const CreateTier: React.FC<Props> = ({ integrationId }) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("paid");
  const [visibility, setVisibility] = useState("");
  const [monthlyLockAddress, setMonthlyLockAddress] = useState("");
  const [yearlyLockAddress, setYearlyLockAddress] = useState("");
  const [network, setNetwork] = useState(0);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [yearlyPrice, setYearlyPrice] = useState(0);
  const [currency, setCurrency] = useState("");
  const { data: session } = useSession();
  const user: DefaultUserMod | null | undefined = session?.user;
  const { signMessageAsync } = useSignMessage({
    message: `${user?.name + ":" + user?.id}`,
  });

  const getTokenDecimals = async (tokenAddress: string, provider: any) => {
    const tokenContract = new ethers.Contract(tokenAddress, ["function decimals() view returns (uint8)"], provider);
    const decimals = await tokenContract.decimals();
    return decimals;
  };

  function formatStablecoinAmount(amount: any, decimals: any) {
    const formattedAmount = ethers.utils.formatUnits(amount, decimals);
    return parseInt(formattedAmount);
  }

  const fetchLockDetails = async (lockAddress: string, setPriceCallback: (x: number) => void) => {
    try {
      const unlockProvider = `https://rpc.unlock-protocol.com/${network}`;
      const provider = new ethers.providers.JsonRpcProvider(unlockProvider);

      const lock = new ethers.Contract(lockAddress, publicLockABI, provider);
      const tokenAddress = await lock.tokenAddress();
      const keyPrice = await lock.keyPrice();
      if (tokenAddress !== ethers.constants.AddressZero) {
        const tokenDecimals = getTokenDecimals(tokenAddress, provider);
        const price = formatStablecoinAmount(keyPrice, await tokenDecimals);
        console.log(`PRICE (${lockAddress}): ${price}`);
        setPriceCallback(price);
      } else {
        const _price = ethers.utils.formatEther(await keyPrice);
        console.log("KEY_PRICE", parseFloat(_price));
        setPriceCallback(parseFloat(_price));
      }
    } catch (e) {
      console.log(`ERR_FETCHING_LOCK_DETAILS (${lockAddress}):`, e);
    }
  };

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        if ((monthlyLockAddress || yearlyLockAddress) && network) {
          fetchLockDetails(monthlyLockAddress, setMonthlyPrice);
          if (yearlyLockAddress) fetchLockDetails(yearlyLockAddress, setYearlyPrice);
        } else {
          console.log("FETCHING PRICE...");
        }
      } catch (e) {
        console.log("ERR_FETCHING_PRICE", e);
      }
    };
    fetchPriceData();
  }, [monthlyLockAddress, yearlyLockAddress, network]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // get sig
      const signature = await signMessageAsync();
      // call backend api
      const response = await axios.post("/api/tier/create", {
        signature,
        message: `${user?.name + ":" + user?.id}`,
        name,
        monthlyLockAddress,
        yearlyLockAddress,
        network,
        description,
        type,
        visibility,
        monthlyPrice,
        yearlyPrice,
        currency: currency.toUpperCase(),
        createdBy: user?.id,
        integrationId,
      });

      response &&
        response.status === 201 &&
        notification.success("Tier created successfully") &&
        router.push(`/user/integrations/${integrationId}`);
    } catch (error: any) {
      console.error("ERR:: Creating tier:", error);
      notification.error(`${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 mb-6">
      <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
        <span className="text-2xl sm:text-3xl mb-4 text-center text-black">Create a tier</span>
        <div className="my-4">
          <InputBase error={!name} placeholder="Tier name" value={name} onChange={setName} />
        </div>
        <div className="my-4">
          <AddressInput
            placeholder="Monthly plan lock address"
            value={monthlyLockAddress}
            onChange={setMonthlyLockAddress}
          />
        </div>
        <div className="my-4">
          <AddressInput
            placeholder="Yearly plan lock address"
            value={yearlyLockAddress}
            onChange={setYearlyLockAddress}
          />
        </div>

        <div className="my-4">
          <select
            name="Network"
            value={network}
            onChange={e => {
              const val = e.target.value;
              setNetwork(parseInt(val));
            }}
            className="select select-bordered select-ghost input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
          >
            {NETWORKS &&
              NETWORKS.map(([_network, _networkId], _index) => (
                <option key={_index} value={_networkId}>
                  {_network}
                </option>
              ))}
          </select>
        </div>

        <div className="my-4">
          <InputBase placeholder="Description..." value={description} onChange={setDescription} />
        </div>
        <div className="my-4">
          <select
            name="type"
            value={type}
            onChange={e => {
              const val = e.target.value;
              setType(val);
            }}
            className="select select-bordered select-ghost input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
          >
            <option value={"paid"}>Paid</option>
          </select>
        </div>
        <div className="my-4">
          <select
            name="visibility"
            value={visibility}
            onChange={e => {
              const val = e.target.value;
              setVisibility(val);
            }}
            className="select select-bordered select-ghost input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
          >
            {/* <option disabled selected> */}
            <option>Choose visibility</option>
            <option value={"public"}>Public</option>
            <option value={"private"}>Private</option>
          </select>
        </div>

        <div className="my-4">
          {!monthlyLockAddress || !network ? (
            <div className="flex items-center input input-bordered input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400">
              Monthly price
            </div>
          ) : (
            <div className="flex items-center input input-bordered input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400">
              {monthlyPrice} /month
            </div>
          )}
        </div>

        <div className="my-4">
          {!yearlyLockAddress || !network ? (
            <div className="flex items-center input input-bordered input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400">
              Yearly price
            </div>
          ) : (
            <div className="flex items-center input input-bordered input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400">
              {yearlyPrice} /year
            </div>
          )}
        </div>

        <div className="my-4">
          <InputBase placeholder="Currency eg USD, EUR..." value={currency} onChange={setCurrency} />
        </div>
        <button
          onClick={handleSubmit}
          className={`btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
            isLoading ? "loading " : ""
          }`}
        >
          Create tier
        </button>
      </div>
    </div>
  );
};