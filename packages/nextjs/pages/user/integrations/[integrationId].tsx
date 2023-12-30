import Head from "next/head";
// import Link from "next/link";
import { useRouter } from "next/router";
import Tier, { TierDocument } from "@lib/models/tier";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
// import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { ListTiers } from "~~/components/ghost-unlock/ListTiers";
import dbConnect from "~~/lib/dbConnect";

interface Props {
  tiers: TierDocument[];
  integrationId: string;
}

const Index: NextPage<Props> & { auth?: boolean } = ({ tiers, integrationId }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Ghost 👻 Unlock </span>
          </h1>
          <ListTiers integrationId={integrationId} tiers={tiers} />
          {tiers && tiers.length > 0 && (
            <div className="px-5 mx-5">
              <button
                onClick={() => router.push(`/user/create-tier?integrationId=${integrationId}`)}
                className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
              >
                New tier
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
Index.auth = true;
export default Index;

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    await dbConnect();
    const integrationId = context.query.integrationId;
    const tiers: TierDocument[] = await Tier.find({ integrationId });
    return { props: { tiers: JSON.parse(JSON.stringify(tiers)), integrationId } };
  } catch (e) {
    console.error(e);
    return { props: { tiers: [] } }; // return an empty array if there's an error
  }
};
