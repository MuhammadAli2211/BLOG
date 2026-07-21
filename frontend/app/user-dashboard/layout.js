import UserNavbar from "./component/UserNavbar";
import "../global.css";


export default function UserDashboardLayout({ children }) {
  return (
    <>
      <UserNavbar />
        {children}
      
    </>
  );
}