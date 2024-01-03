import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Spinner } from "~~/components/assets/Spinner";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const config = useScaffoldConfig();
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
  const mainnetProvider = ethers.getDefaultProvider(`https://mainnet.infura.io/v3/${infuraKey}`);
  const polygonProvider = ethers.getDefaultProvider(`https://polygon-mainnet.infura.io/v3/${infuraKey}`);

  // Token addresses
  // const SPORKTokenMainnet = "0xb624fde1a972b1c89ec1dad691442d5e8e891469";
  const SPORKTokenMATIC = "0x9CA6a77C8B38159fd2dA9Bd25bc3E259C33F5E39";
  const sSPORKToken = "0x058d96BAa6f9D16853970b333ed993aCC0c35aDd";
  const BBBToken = "0x1e988ba4692e52bc50b375bcc8585b95c48aad77";

  const [sporkBalance, setSporkBalance] = useState(0);
  const [sSporkBalance, setSSporkBalance] = useState(0);
  const [bbbBalance, setBbbBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isMember, setIsMember] = useState("");
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const inputError = "border-red-500";

  useEffect(() => {
    // Fetch vote token balance when wallet address changes
    const fetchBalance = async () => {
      try {
        if (!address) return 0;
        setIsLoading(true);
        // contract ABI
        const ABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",
        ];

        // Tokens contract instance
        const SPORKTokenContract = new ethers.Contract(SPORKTokenMATIC, ABI, polygonProvider);
        const sSPORKTokenContract = new ethers.Contract(sSPORKToken, ABI, polygonProvider);
        const BBBTokenContract = new ethers.Contract(BBBToken, ABI, mainnetProvider);

        // Fetch balances for the connected wallet address
        const SPORKBalance = await SPORKTokenContract.balanceOf(address);
        const sSPORKBalance = await sSPORKTokenContract.balanceOf(address);
        const BBBBalance = await BBBTokenContract.balanceOf(address);
        // format balances and set state variables
        setSporkBalance(Number(ethers.formatEther(SPORKBalance)));
        setSSporkBalance(Number(ethers.formatEther(sSPORKBalance)));
        setBbbBalance(Number(BBBBalance));
        autoSetIsMember(Number(ethers.formatEther(sSPORKBalance)));
        setIsLoading(false);
      } catch (e) {
        console.log("ERR_FETCHING_BALANCE:", e);
      }
    };
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, config]);

  const autoSetIsMember = (_sSporkBalance: number) => {
    if (_sSporkBalance > 0) {
      setIsMember("yes");
      setIsAlreadyMember(true);
      return;
    }
    return setIsMember("");
  };

  const data = {
    input: {
      bbbBalance,
      email,
      ethAddress: address,
      sSporkBalance,
      sporkBalance,
      sporkdaoMember: isMember,
    },
  };

  const submitApplication = async () => {
    const _isMember = validateIsMember(isMember);
    if (!_isMember) {
      return;
    } else {
      setIsSubmitting(true);
      const { encrypted } = await encryptData();
      encrypted &&
        setTimeout(() => {
          setIsSubmitting(false);
          generateLink(encrypted);
        }, 2000);
    }
  };

  const removeInputErrorClass = () => {
    const selectElement = document.getElementById("isMember");
    selectElement?.classList.remove(inputError);
  };

  const addInputErrorClass = () => {
    const selectElement = document.getElementById("isMember");
    selectElement?.classList.add(inputError);
    selectElement?.focus();
  };

  const validateIsMember = (isMember: string) => {
    if (!isMember) {
      addInputErrorClass();
      return;
    }
    removeInputErrorClass();
    return isMember;
  };

  const encryptData = async () => {
    try {
      const apiResponse = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const encryptedData = await apiResponse.json();
      return encryptedData;
    } catch (e) {
      console.log("ERR_POSTING_DATA", e);
    }
  };

  const generateLink = (encryptedData: string) => {
    const url = `https://ethdenver.tokenproof.xyz/?value=${encryptedData}`;
    notification.success("Application Submitted");
    router.push(url);
    return url;
  };

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 text-center flex flex-col justify-center max-w-md">
          <h1 className="mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">ETH Denver 2024</span>
          </h1>
          {isLoading ? (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="balances border-solid rounded-md border-gray-600 flex justify-between w-full mt-3 mb-8">
              <div className="flex-col ">
                <div>$SPORK</div>
                <div>{sporkBalance}</div>
              </div>
              <div className="flex-col">
                <div>sSPORK</div> <div>{sSporkBalance}</div>
              </div>
              <div className="flex-col">
                <div>BBB</div> <div>{bbbBalance}</div>
              </div>
            </div>
          )}
          <div className="membership mt-8">
            <h2 className="text-lg font-medium my-5">SporkDAO</h2>
            <p className="my-8">
              SporkDAO represents the final leg of the journey towards transitioning ETHDenver to a community owned
              ecosystem.
            </p>
            <label className="cursor-pointer label flex flex-col pt-8">
              <span className="label-text mb-4 w-full text-left">Joined SporkDAO?</span>
              <select
                disabled={isAlreadyMember}
                value={isMember}
                onChange={e => {
                  const val = e.target.value;
                  setIsMember(val);
                  removeInputErrorClass();
                }}
                className="select select-bordered w-full focus:outline-none"
                id="isMember"
              >
                <option value="">...</option>
                <option value="yes">Yes</option>
                <option value="no">No, I want to purchase a ticket</option>
                <option value="will_join">I want to join but don&#39;t have what I need</option>
              </select>
            </label>
            {isMember && isMember === "no" && (
              <div className="form-control mt-5">
                <label className="cursor-pointer label px-10 mx-2">
                  <span className="label-text">Join SporkDAO</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                    className="checkbox checkbox-success"
                  />
                </label>
              </div>
            )}
          </div>
          <div className="email my-8 pb-8">
            {/* <h2 className="text-lg font-medium pt-8 mt-8 mb-8">Stay Updated</h2> */}
            <p className="my-8">Submit your application to secure your role in ETHDenver history</p>

            <div className="form-control mt-2 mb-8">
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => {
                  const val = e.target.value;
                  setEmail(val);
                }}
                className="input input-bordered input-md w-full"
              />
              <button onClick={submitApplication} className={`btn mt-5 btn-primary`} disabled={!email || !isValidEmail}>
                {isSubmitting && <span className="loading loading-spinner"></span>}
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
