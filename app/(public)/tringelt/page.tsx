import { redirect } from "next/navigation";

/** Legacy /tringelt alias — tips are voluntary article support, not VIP. */
export default function TringeltAliasPage() {
  redirect("/articles");
}
