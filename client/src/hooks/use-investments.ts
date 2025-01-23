import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Investment, Token } from '@db/schema';
import { useToast } from '@/hooks/use-toast';

export function useInvestments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments, isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Token[]>({
    queryKey: ['/api/portfolio'],
    staleTime: 30000,
  });

  const purchaseTokens = useMutation({
    mutationFn: async ({ investmentId, amount }: { investmentId: number, amount: number }) => {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId, amount }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both investments and portfolio queries
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      toast({
        title: "Success",
        description: "Successfully purchased tokens"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  return {
    investments,
    portfolio,
    isLoading: investmentsLoading || portfolioLoading,
    purchaseTokens: purchaseTokens.mutate
  };
}