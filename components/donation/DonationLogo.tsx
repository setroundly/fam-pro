import type { DonationDestinationId } from "@/lib/donationDestinations";

const logoClass =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow-inner";

export function DonationLogo({ id }: { id: DonationDestinationId }) {
  switch (id) {
    case "jrc":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-red-500 to-red-800`}>
          ✚
        </div>
      );
    case "unicef":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-sky-400 to-blue-800`}>
          U
        </div>
      );
    case "wwf":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-emerald-400 to-emerald-900`}>
          W
        </div>
      );
    case "animal":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-amber-400 to-orange-900`}>
          🐾
        </div>
      );
    case "children":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-violet-400 to-purple-900`}>
          ★
        </div>
      );
    case "disaster":
      return (
        <div className={`${logoClass} bg-gradient-to-br from-orange-500 to-red-900`}>
          !
        </div>
      );
    case "other":
    default:
      return (
        <div className={`${logoClass} bg-gradient-to-br from-zinc-500 to-zinc-800`}>
          ···
        </div>
      );
  }
}
