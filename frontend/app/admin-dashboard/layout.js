import AdminNavbar from "./component/admin-navbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}