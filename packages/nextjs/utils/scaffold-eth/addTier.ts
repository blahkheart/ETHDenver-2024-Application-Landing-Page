import axios from "axios";

export async function addTier(
  userTiers: any,
  headers: any,
  siteUrl: string,
  memberId: string,
  tierName: string,
  tierId: string,
  timeStamp: number,
) {
  try {
    const memberUrl = `${siteUrl}/ghost/api/admin/members/${memberId}`;
    let payload;
    if (userTiers.length) {
      payload = {
        members: [
          {
            tiers: [
              ...userTiers,
              {
                name: tierName,
                id: tierId,
                expiry_at: timeStamp,
              },
            ],
          },
        ],
      };
    } else {
      payload = {
        members: [
          {
            tiers: [
              {
                name: tierName,
                id: tierId,
                expiry_at: timeStamp,
              },
            ],
          },
        ],
      };
    }
    const ghostAdminResponse = await axios.put(memberUrl, payload, { headers });

    return ghostAdminResponse;
  } catch (error) {
    console.error(error);
  }
}
