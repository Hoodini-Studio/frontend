import type { Metadata } from "next";
import { ProfileDetails } from "@/components/profile/profile-details";

export const metadata: Metadata = {
  title: "Profile",
};

export default function AccountProfilePage() {
  return <ProfileDetails />;
}
