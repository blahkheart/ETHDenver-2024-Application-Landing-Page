import Head from "next/head";
import Subscriber, { SubscriberDocument } from "@lib/models/subscriber";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import { ListSubscribers } from "~~/components/ghost-unlock/ListSubscribers";
import dbConnect from "~~/lib/dbConnect";

interface Props {
  subscribers: SubscriberDocument[];
}

const Index: NextPage<Props> & { auth?: boolean } = ({ subscribers }) => {
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
          <ListSubscribers subscribers={subscribers} />
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
    // const subscriber = context.query.address;
    console.log("context", context.query.address);
    const subscribers: SubscriberDocument[] = await Subscriber.find({});
    return { props: { subscribers: JSON.parse(JSON.stringify(subscribers)) } };
  } catch (e) {
    console.error(e);
    return { props: { subscribers: [] } }; // return an empty array if there's an error
  }
};
