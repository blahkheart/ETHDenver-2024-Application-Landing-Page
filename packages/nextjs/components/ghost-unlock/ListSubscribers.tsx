import { useState } from "react";
import { useRouter } from "next/router";
import { SubscriberDocument } from "@lib/models/subscriber";

interface Props {
  subscribers: SubscriberDocument[];
}

export const ListSubscribers: React.FC<Props> = ({ subscribers }) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subscribers/${id}`, {
        method: "DELETE",
      });
      router.reload();
    } catch (error) {
      setErrorMessage("Failed to delete subscriber");
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10 px-10 mb-6 w-full">
      <div className="flex flex-col bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full">
        <h1 className="text-3xl font-bold mb-6">My Subscribers</h1>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
          </div>
        )}
        <ul>
          {subscribers && subscribers.length ? (
            subscribers.map(subscriber => (
              <li key={subscriber._id} className="mb-4">
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold">{subscriber.email}</h2>
                  <button
                    onClick={() => handleDelete(subscriber._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
                {/* <p className="text-gray-500">{subscriber.address}</p> */}
                <div className="divider px-10 mx-10 py-3"></div>
              </li>
            ))
          ) : (
            <li className="text-3xl font-bold mb-4">
              <h2 className="text-2xl font-bold mb-6">You have no subscribers</h2>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
