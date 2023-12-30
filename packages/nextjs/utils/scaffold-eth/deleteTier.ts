import axios from "axios";

export async function deleteTier(res: any, headers: any, memberUrl: string, member: any, tierIdToDelete: string) {
  try {
    const updatedTiers = member.tiers.filter((tier: any) => tier.id !== tierIdToDelete);
    const payload = {
      members: [
        {
          ...member,
          tiers: updatedTiers,
        },
      ],
    };
    const ghostAdminResponse = await axios.put(memberUrl, payload, { headers });

    if (ghostAdminResponse.status === 200) {
      return res.status(200).json({ message: "Tier deleted successfully." });
    } else {
      return res.status(500).json({ message: "Error deleting tier" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
