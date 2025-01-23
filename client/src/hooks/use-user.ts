import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  username: string;
  password: string;
};

type RequestResult = {
  ok: true;
  user: User;
} | {
  ok: false;
  message: string;
};

async function handleRequest(
  url: string,
  method: string,
  body?: LoginData
): Promise<RequestResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      const message = await response.text();
      return { ok: false, message };
    }

    const data = await response.json();
    return { ok: true, user: data.user };
  } catch (e: any) {
    return { ok: false, message: e.toString() };
  }
}

export function useUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/user'],
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => handleRequest('/api/login', 'POST', data),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.setQueryData(['/api/user'], result.user);
        toast({
          title: "Success",
          description: "Successfully logged in"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: LoginData) => handleRequest('/api/register', 'POST', data),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.setQueryData(['/api/user'], result.user);
        toast({
          title: "Success",
          description: "Successfully registered"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => handleRequest('/api/logout', 'POST'),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.setQueryData(['/api/user'], null);
        toast({
          title: "Success",
          description: "Successfully logged out"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message
        });
      }
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
