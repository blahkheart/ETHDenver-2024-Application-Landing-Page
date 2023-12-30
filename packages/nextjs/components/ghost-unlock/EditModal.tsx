import { useEffect, useState } from "react";
import { InputBase } from "../scaffold-eth";
import crypto from "crypto";
import { useSession } from "next-auth/react";
import { useSignMessage } from "wagmi";
import { DefaultUserMod } from "~~/interfaces/defaultUserModifier";
import { IntegrationModalValue } from "~~/types/integrationModalValues";
import { TierModalValues } from "~~/types/tierModalValues";
import { notification } from "~~/utils/scaffold-eth";
import { encryptData as encryptApiKey } from "~~/utils/scaffold-eth";

interface Props {
  id: string;
  userId: string;
  type: "edit" | "integration";
}

const defaultIntegrationModalValues = {
  name: "",
  description: "",
  apiKey: "",
  apiKeyInternal: "",
  siteUrl: "",
};

const defaultTierModalValues = {
  name: "",
  description: "",
  visibility: "",
  yearlyPrice: 0,
};

export const EditModal: React.FC<Props> = ({ id, userId, type }) => {
  const [integrationModalValues, setIntegrationModalValues] =
    useState<IntegrationModalValue>(defaultIntegrationModalValues);
  const { data: session } = useSession();
  const user: DefaultUserMod | null | undefined = session?.user;

  const [tierModalValues, setTierModalValues] = useState<TierModalValues>(defaultTierModalValues);
  const [closeModalBtn, setCloseModalBtn] = useState<HTMLLabelElement>();
  const { signMessageAsync } = useSignMessage({
    message: `${user?.name + ":" + user?.id}`,
  });
  const envSecret = process.env.NEXT_PUBLIC_SECRET;

  const clearInputsAndCloseModal = () => {
    setIntegrationModalValues(defaultIntegrationModalValues);
    setTierModalValues(defaultTierModalValues);
    closeModalBtn?.click();
  };

  // Add "click" event listener to modal close button once component is loaded
  useEffect(() => {
    try {
      const _closeModalBtn = document.querySelector<HTMLLabelElement>(".edit-modal-close");
      if (_closeModalBtn) {
        setCloseModalBtn(_closeModalBtn);
        _closeModalBtn.addEventListener("click", () => {
          setIntegrationModalValues(defaultIntegrationModalValues);
          setTierModalValues(defaultTierModalValues);
        });
      }
      // Clean up the event listener when the component unmounts
      return () => {
        if (_closeModalBtn) {
          _closeModalBtn.removeEventListener("click", () => {
            setIntegrationModalValues(defaultIntegrationModalValues);
            setTierModalValues(defaultTierModalValues);
          });
        }
      };
    } catch (e) {
      console.log("err:: close modal btn");
    }
  }, []);

  const handleEditTier = async (id: string) => {
    try {
      console.log(id);
      console.log(userId);
      clearInputsAndCloseModal();
    } catch (error) {
      console.error("Failed to edit tier");
    }
  };

  const handleEditIntegration = async (id: string) => {
    try {
      // sign message to create encryption key
      const encryptionKey = await signMessageAsync();
      // use encrytionKey to encrypt api key
      const _encryptedApiKey = encryptApiKey(integrationModalValues.apiKey, encryptionKey);
      // declare variable for saving encrypted internal apiKey
      let _encryptedApiKeyInternal = "";
      // declare variable for saving user secret generated
      let _userSecret = "";

      if (!envSecret) return notification.error(`Error fetching secret`);
      _userSecret = crypto.randomBytes(32).toString("hex");
      // internal encrytionKey to encrypt internal apiKey
      const internalEncryptionKey = `${_userSecret}:${envSecret}`;
      console.log("test::", internalEncryptionKey);
      if (integrationModalValues.apiKey)
        _encryptedApiKeyInternal = encryptApiKey(integrationModalValues.apiKey, internalEncryptionKey);
      console.log("test::internalEncryptionKey", _encryptedApiKeyInternal);

      const result = await fetch("/api/integration/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          description: integrationModalValues.description,
          siteUrl: integrationModalValues.siteUrl,
          secret: _userSecret,
          apiKey: _encryptedApiKey,
          apiKeyInternal: _encryptedApiKeyInternal,
          name: integrationModalValues.name,
        }),
      });
      console.log("response", result);
      result && notification.success("Integration updated successfully") && clearInputsAndCloseModal();
    } catch (error: any) {
      console.error("Failed to edit integration");
      notification.error(`${error.message}`);
    }
  };

  const editIntegration = (
    <div>
      <input type="checkbox" id={`edit-modal-${id}`} className="modal-toggle" />
      <label htmlFor={`edit-modal-${id}`} className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="text-xl font-bold sm:text-2xl mb-6 text-center">Edit Integration</h3>
          <div className="my-4">
            <InputBase
              placeholder="Name"
              value={integrationModalValues.name}
              onChange={e => setIntegrationModalValues({ ...integrationModalValues, name: e })}
            />
          </div>
          <div className="my-4">
            <InputBase
              placeholder="Description..."
              value={integrationModalValues.description}
              onChange={e => setIntegrationModalValues({ ...integrationModalValues, description: e })}
            />
          </div>
          <div className="my-4">
            <InputBase
              placeholder="https://myghostblog.com"
              value={integrationModalValues.siteUrl}
              onChange={e => setIntegrationModalValues({ ...integrationModalValues, siteUrl: e })}
            />
          </div>
          <div className="my-4">
            <InputBase
              placeholder="API key"
              value={integrationModalValues.apiKey}
              onChange={e => setIntegrationModalValues({ ...integrationModalValues, apiKey: e })}
            />
          </div>
          <div className="modal-action ">
            <button
              onClick={() => {
                handleEditIntegration(id);
              }}
              className="btn border-transparent hover:border-transparent px-8 mr-4 text-white bg-green-600 hover:bg-green-700"
            >
              Save
            </button>
            <label htmlFor={`edit-modal-${id}`} className="btn edit-modal-close">
              Cancel
            </label>
          </div>
        </label>
      </label>
    </div>
  );

  const editTier = (
    <div>
      <input type="checkbox" id={`edit-modal-${id}`} className="modal-toggle" />
      <label htmlFor={`edit-modal-${id}`} className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="text-xl font-bold sm:text-2xl mb-6 text-center">Edit Tier</h3>
          <div className="my-4">
            <InputBase
              placeholder="Tier name"
              value={tierModalValues.name}
              onChange={e => setTierModalValues({ ...tierModalValues, name: e })}
            />
          </div>
          <div className="my-4">
            <InputBase
              placeholder="Description..."
              value={tierModalValues.description}
              onChange={e => setTierModalValues({ ...tierModalValues, description: e })}
            />
          </div>
          <div className="my-4">
            <select
              name="visibility"
              onChange={e => {
                const val = e.target.value;
                setTierModalValues({ ...tierModalValues, visibility: val });
              }}
              className="select select-bordered select-ghost input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
            >
              <option selected disabled>
                Choose visibility
              </option>
              <option value={"public"}>Public</option>
              <option value={"private"}>Private</option>
            </select>
          </div>

          <div className="my-4">
            <input
              className="input input-bordered input-ghost focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
              placeholder={"Yearly price"}
              name={"yearly-price"}
              type="number"
              value={tierModalValues.yearlyPrice}
              onChange={e => {
                const val = e.target.value;
                setTierModalValues({ ...tierModalValues, yearlyPrice: parseInt(val) });
              }}
              autoComplete="off"
            />
          </div>

          <div className="modal-action ">
            <button
              onClick={() => handleEditTier(id)}
              className="btn border-transparent hover:border-transparent px-8 mr-4 text-white bg-green-600 hover:bg-green-700"
            >
              Save
            </button>
            <label className="btn edit-modal-close" htmlFor={`edit-modal-${id}`}>
              Cancel
            </label>
          </div>
        </label>
      </label>
    </div>
  );

  return <div>{type === "edit" ? editTier : editIntegration}</div>;
};