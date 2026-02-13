import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./auth/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
