import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import unlockLogo from "../public/assets/unlockLogo.png";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Unlock Ghost</span>
          </h1>
          <p className="text-center text-lg">Enable paid subscriptions on your Ghost site using Unlock Memberships</p>
          <p className="text-center mt-5">
            {session?.user?.name ? (
              <Link
                href={"/user"}
                className="btn rounded-full capitalize font-normal font-white gap-1 hover:gap-2 transition-all tracking-widest"
              >
                Get started
              </Link>
            ) : (
              "Connect your wallet to begin"
            )}
          </p>
        </div>

        <div className="flex-grow w-full mt-4 px-8 py-4">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 text-center items-center max-w-xs rounded-3xl">
              <Image priority={true} src={unlockLogo} alt="Unlock Protocol" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
