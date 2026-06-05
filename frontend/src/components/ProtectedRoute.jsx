import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { clearAuthToken, getAuthToken } from "../lib/auth";
import { navigateTo } from "../lib/navigation";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

function renderChildren(children, user) {
  return typeof children === "function" ? children({ user }) : children;
}

function UnauthorizedState() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <ErrorState message="Seu perfil não tem permissão para acessar esta área." />
        <button
          type="button"
          onClick={() => navigateTo("/")}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Voltar para a página inicial
        </button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ roles = [], children, user: providedUser, redirectTo = "/login" }) {
  const [currentUser, setCurrentUser] = useState(providedUser || null);
  const [isLoading, setIsLoading] = useState(!providedUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (providedUser) {
      setCurrentUser(providedUser);
      setIsLoading(false);
      setError("");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      navigateTo(redirectTo);
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const abortController = new AbortController();

    async function loadCurrentUser() {
      setIsLoading(true);
      setError("");

      try {
        const response = await apiRequest("/auth/me", { signal: abortController.signal });

        if (!isActive) {
          return;
        }

        setCurrentUser(response.data);
      } catch (loadError) {
        if (!isActive || loadError.name === "AbortError") {
          return;
        }

        clearAuthToken();
        setCurrentUser(null);
        setError(loadError.message || "Não foi possível validar sua sessão.");
        navigateTo(redirectTo);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [providedUser, redirectTo]);

  if (isLoading) {
    return <LoadingState label="Validando acesso..." />;
  }

  if (error) {
    return <LoadingState label="Redirecionando para o login..." />;
  }

  if (!currentUser) {
    return null;
  }

  if (roles.length && !roles.includes(currentUser.role)) {
    return <UnauthorizedState />;
  }

  return renderChildren(children, currentUser);
}
