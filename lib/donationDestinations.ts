export type DonationDestinationId =
  | "jrc"
  | "unicef"
  | "wwf"
  | "animal"
  | "children"
  | "disaster"
  | "other";

export interface DonationDestinationOption {
  id: DonationDestinationId;
  name: string;
  url: string;
  tagline: string;
  accent: string;
  logoKey: DonationDestinationId;
}

export const DONATION_DESTINATIONS: DonationDestinationOption[] = [
  {
    id: "jrc",
    name: "日本赤十字社",
    url: "https://www.jrc.or.jp/donate/",
    tagline: "人道支援",
    accent: "from-red-600/90 to-red-900/80",
    logoKey: "jrc",
  },
  {
    id: "unicef",
    name: "UNICEF",
    url: "https://www.unicef.or.jp/cooperation/",
    tagline: "子どもの権利",
    accent: "from-sky-500/90 to-blue-900/80",
    logoKey: "unicef",
  },
  {
    id: "wwf",
    name: "WWF",
    url: "https://www.wwf.or.jp/get_involved/donate/",
    tagline: "自然保護",
    accent: "from-emerald-500/90 to-emerald-950/80",
    logoKey: "wwf",
  },
  {
    id: "animal",
    name: "動物愛護団体",
    url: "https://www.jaws.or.jp/donate/",
    tagline: "いのちを守る",
    accent: "from-amber-500/90 to-orange-950/80",
    logoKey: "animal",
  },
  {
    id: "children",
    name: "子ども支援",
    url: "https://www.savechildren.or.jp/support/",
    tagline: "未来への投資",
    accent: "from-violet-500/90 to-purple-950/80",
    logoKey: "children",
  },
  {
    id: "disaster",
    name: "災害支援",
    url: "https://www.jrc.or.jp/activity/emergency/",
    tagline: "緊急支援",
    accent: "from-orange-500/90 to-red-950/80",
    logoKey: "disaster",
  },
  {
    id: "other",
    name: "その他",
    url: "",
    tagline: "自由に指定",
    accent: "from-zinc-600/90 to-zinc-950/80",
    logoKey: "other",
  },
];

export function getDonationDestination(
  id: DonationDestinationId
): DonationDestinationOption | undefined {
  return DONATION_DESTINATIONS.find((d) => d.id === id);
}
