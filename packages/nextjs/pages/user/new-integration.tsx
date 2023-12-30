import Head from "next/head";
// import Integration, { IntegrationDocument } from "@lib/models/integration";
import type { NextPage } from "next";
// import { GetServerSideProps } from "next";
import { useAccount } from "wagmi";
import { CreateIntegration } from "~~/components/ghost-unlock/CreateIntegration";

const NewIntegration: NextPage & { auth?: boolean } = () => {
  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>Scaffold-eth Example Ui</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>
      {isConnected ? (
        <div className="grid lg:grid-cols-1 flex-grow" data-theme="exampleUi">
          <CreateIntegration />
        </div>
      ) : (
        <div className="flex items-center flex-col flex-grow pt-10 mt-8">
          <h2 className="block text-4xl font-bold">Connect your wallet</h2>
        </div>
      )}
    </>
  );
};
NewIntegration.auth = true;
export default NewIntegration;
