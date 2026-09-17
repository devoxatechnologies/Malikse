import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { authState, user } = useAuthStore();

  if (authState !== "AUTHENTICATED" || !user) {
    return <Redirect href="/login" />;
  }

  // Redirect based on role if authenticated
  switch (user.role) {
    case "owner":
      return <Redirect href="/my-properties" />;
    case "advisor":
      return <Redirect href="/advisor/tasks" />;
    case "admin":
      return <Redirect href="/admin/dashboard" />;
    case "buyer":
    default:
      return <Redirect href="/search" />;
  }
}
