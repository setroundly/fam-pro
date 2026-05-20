import { fetchJson } from "@/lib/fetchJson";

export async function verifyFamilyMembership(
  familyId: string,
  userId: string
): Promise<boolean> {
  const { res, data } = await fetchJson<{ member?: boolean }>(
    `/api/families/verify?familyId=${encodeURIComponent(familyId)}&userId=${encodeURIComponent(userId)}`
  );
  return res.ok && data.member === true;
}
