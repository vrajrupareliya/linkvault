import { auth } from "../../../auth";

export default async function DashboardPage() {
  const session = await auth();

  return <p>Hello {session?.user?.name}</p>;
}