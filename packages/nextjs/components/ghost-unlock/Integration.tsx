import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditModal } from "./EditModal";
import { useSession } from "next-auth/react";
import { useSignMessage } from "wagmi";
import { ClipboardDocumentIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { DefaultUserMod } from "~~/interfaces/defaultUserModifier";
import { IntegrationData } from "~~/types/integrationData";
import { decryptData } from "~~/utils/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface Props {
  integration: IntegrationData;
}

export const Integration: React.FC<Props> = ({ integration }) => {
  const { id, name, apiKey, siteUrl, description, createdBy } = integration;
  const [showApiKey, setShowApiKey] = useState(false);
  const [decryptedApiKey, setDecryptedApiKey] = useState("");
  const { data: session } = useSession();
  const user: DefaultUserMod | null | undefined = session?.user;
  const { isLoading, signMessageAsync } = useSignMessage({
    message: `${user?.name + ":" + user?.id}`,
  });
  const showApiKeyRef = useRef(showApiKey);

  useEffect(() => {
    showApiKeyRef.current = showApiKey;
  }, [showApiKey]);

  const handleDelete = async (id: string) => {
    try {
      console.log("id", id);
    } catch (error) {
      console.log("Failed to delete integration");
    }
  };

  function shortenString(str: string, startLength = 10, endLength = 6): string {
    const length = str.length;
    if (length <= startLength + endLength) {
      return str;
    }
    const start = str.slice(0, startLength);
    const end = str.slice(length - endLength, length);
    return `${start}...${end}`;
  }

  const handleCopyApiKey = (text: string) => {
    if (showApiKeyRef.current) {
      navigator.clipboard.writeText(text);
      notification.success("Copied text");
    } else {
      notification.error("Cannot copy API key when it's hidden");
      return;
    }
  };

  return (
    <ul>
      <li key={id} className="mb-4">
        <div className="flex justify-between">
          <Link href={`/user/integrations/${id}`} passHref className="link link-accent no-underline">
            <h2 className="text-2xl font-bold my-0">{name}</h2>
          </Link>
          <div>
            <label
              htmlFor={`edit-modal-${id}`}
              className="mr-5 btn border-transparent hover:border-transparent bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </label>
            <button
              onClick={() => handleDelete(id)}
              className="btn border-transparent hover:border-transparent bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="text-gray-500 mb-4">
          Description:
          <p className="break-words my-0 mt-1 pr-10">{description}</p>
        </div>
        <div className="text-gray-500 mb-4">
          Blog URL:
          <p className="break-words my-0 mt-1">{siteUrl}</p>
        </div>
        <div className="text-gray-500">
          API Key:
          <div className="flex mt-1">
            <input
              id="api-key-text"
              className="my-0 rounded border-none focus:outline-none focus:bg-white"
              type={showApiKey ? "text" : "password"}
              value={shortenString(showApiKey ? decryptedApiKey : apiKey)}
              readOnly
            />
            {showApiKey && (
              <button
                className="btn rounded-lg btn-sm mr-3"
                onClick={() => {
                  handleCopyApiKey(decryptedApiKey);
                }}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            )}
            <button
              className={`btn rounded-lg btn-sm ${isLoading ? "loading " : ""}`}
              onClick={async () => {
                try {
                  if (!showApiKey) {
                    const _decryptKey = await signMessageAsync();
                    const _decryptedData = decryptData(apiKey, _decryptKey);
                    _decryptedData && setDecryptedApiKey(_decryptedData);
                  }
                  setShowApiKey(!showApiKey);
                } catch (e) {
                  console.log("err:show/hide api key", e);
                }
              }}
            >
              {isLoading ? null : !showApiKey ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="divider px-10 mx-10 py-3"></div>
        <EditModal id={id} userId={createdBy} type={"integration"} />
      </li>
    </ul>
  );
};
