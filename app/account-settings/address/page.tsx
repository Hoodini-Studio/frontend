import type { Metadata } from "next";
import { AddressSettings } from "@/components/profile/address-settings";

export const metadata: Metadata = {
  title: "Shipping address",
};

export default function AccountAddressPage() {
  return <AddressSettings />;
}
