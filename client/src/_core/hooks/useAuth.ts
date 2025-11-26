import { useUser, useClerk } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const utils = trpc.useUtils();

  // Buscar dados do usuário do banco de dados via tRPC
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isSignedIn, // Só busca se estiver logado no Clerk
  });

  const logout = useCallback(async () => {
    try {
      await signOut();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [signOut, utils]);

  const state = useMemo(() => {
    const dbUser = meQuery.data ?? null;
    
    // Combinar dados do Clerk com dados do banco
    const user = dbUser ? {
      ...dbUser,
      clerkId: clerkUser?.id,
      imageUrl: clerkUser?.imageUrl,
    } : null;

    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(user)
    );

    return {
      user,
      loading: !isLoaded || meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(isSignedIn && dbUser),
    };
  }, [
    clerkUser,
    isLoaded,
    isSignedIn,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

