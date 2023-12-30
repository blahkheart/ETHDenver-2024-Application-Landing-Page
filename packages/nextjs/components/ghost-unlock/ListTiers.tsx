import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TierDocument } from "@lib/models/";

interface Props {
  tiers: TierDocument[];
  integrationId: string;
}

export const ListTiers: React.FC<Props> = ({ tiers, integrationId }) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tiers/${id}`, {
        method: "DELETE",
      });
      router.reload();
    } catch (error) {
      setErrorMessage("Failed to delete tier");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-10 mb-6 w-full">
      <div className="flex flex-col bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
        <h1 className="text-3xl font-bold mb-6">My Tiers</h1>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
          </div>
        )}
        <ul>
          {tiers && tiers.length ? (
            tiers.map(tier => (
              <li key={tier._id} className="mb-4">
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold">{tier.name}</h2>
                  <button
                    onClick={() => handleDelete(tier._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-500">{tier.description}</p>
                <p className="text-gray-500">Type: {tier.type}</p>
                <p className="text-gray-500">Visibility: {tier.visibility}</p>
                <p className="text-gray-500">Currency: {tier.currency}</p>
                <div className="divider px-10 mx-10 py-3"></div>
              </li>
            ))
          ) : (
            <li className="text-3xl font-bold mb-4">
              <h2 className="text-2xl font-bold mb-10 pb-2">You have no tiers</h2>
              <div>
                <Link href={`/user/create-tier?integrationId=${integrationId}`} passHref className="link no-underline">
                  <button className="btn btn-primary rounded-full capitalize font-normal font-white flex items-center gap-1 hover:gap-2 transition-all tracking-widest">
                    New tier
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
