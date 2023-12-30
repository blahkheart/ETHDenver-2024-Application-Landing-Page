import Head from "next/head";
import { useRouter } from "next/router";
import Integration, { IntegrationDocument } from "@lib/models/integration";
import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { ListIntegrations } from "~~/components/ghost-unlock/ListIntegrations";
import dbConnect from "~~/lib/dbConnect";
import authOptions from "~~/pages/api/auth/auth-options";

interface Props {
  integrations: IntegrationDocument[];
}

const Index: NextPage<Props> & { auth?: boolean } = ({ integrations }) => {
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
          <ListIntegrations integrations={integrations} />
          {integrations && integrations.length > 0 && (
            <div className="px-5 mx-5">
              <button
                onClick={() => router.push("/user/new-integration")}
                className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
              >
                New integration
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
    const session: any = await getServerSession(context.req, context.res, authOptions);
    const userId = session?.user.id;
    const integrations: IntegrationDocument[] = await Integration.find({ createdBy: userId });
    return { props: { integrations: JSON.parse(JSON.stringify(integrations)) } };
  } catch (e) {
    console.error(e);
    return { props: { integrations: [] } }; // return an empty array if there's an error
  }
};
