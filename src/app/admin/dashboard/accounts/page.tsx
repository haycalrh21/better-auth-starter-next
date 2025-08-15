import AdminLayout from "../../layout/layout";
import CreateAccount from "./_components/createAccount";

export default function Page() {
  return (
    <AdminLayout>
      <div className="grid auto-rows-min gap-4 md:grid-cols-1">
        <CreateAccount />
      </div>
    </AdminLayout>
  );
}
