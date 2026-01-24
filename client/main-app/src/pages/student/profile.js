import DashboardHome from "../../components/student/DashboardHome";
import { useAuth } from "../../context/AuthContext"; 
import Layout from "./layout";

export default function Profile() {
  const { user } = useAuth();

  return (
    <Layout>
      <DashboardHome user={user} />
    </Layout>
  );
}