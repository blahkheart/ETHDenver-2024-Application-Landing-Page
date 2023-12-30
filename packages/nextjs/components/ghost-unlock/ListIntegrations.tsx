import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Integration } from "./Integration";
import { IntegrationDocument } from "@lib/models/integration";
import { IntegrationData } from "~~/types/integrationData";

interface Props {
  integrations: IntegrationDocument[];
}

export const ListIntegrations: React.FC<Props> = ({ integrations }) => {
  const router = useRouter();
  const [integrationsList, setIntegrationsList] = useState<IntegrationData[]>([]);

  useEffect(() => {
    try {
      const _integrations: IntegrationData[] = [];
      if (integrations) {
        integrations.map(data => {
          const x: IntegrationData = {
            id: data._id.toString(),
            name: data.name,
            description: data.description,
            apiKey: data.apiKey,
            siteUrl: data.siteUrl,
            createdBy: data.createdBy.toString(),
          };
          _integrations.push(x);
          setIntegrationsList(_integrations);
        });
      }
    } catch (e) {
      console.log("ERR:: Integrations list", e);
    }
  }, [integrations]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-10 mb-6 w-full">
      <div className="flex flex-col bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
        <h1 className="text-3xl font-bold mb-6">My Integrations</h1>
        <ul>
          {integrationsList && integrationsList.length ? (
            integrationsList.map((integration, index: number) => <Integration key={index} integration={integration} />)
          ) : (
            <li className="text-3xl font-bold mb-4">
              <h2 className="text-2xl font-bold mb-10 pb-2">You have no integrations</h2>
              <div>
                <Link href="/user/new-integration" passHref className="link no-underline">
                  <button
                    onClick={() => router.push("/user/new-integration")}
                    className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
                  >
                    New integration
                  </button>
                </Link>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
