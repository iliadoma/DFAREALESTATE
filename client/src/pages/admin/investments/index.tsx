import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, Image } from "lucide-react";
import AdminLayout from "@/components/layouts/admin-layout";
import type { Investment } from "@db/schema";
import { useI18n } from "@/lib/i18n/context";

export default function AdminInvestments() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: investments, isLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      toast({
        title: "Success",
        description: "Investment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this investment?")) {
      deleteMutation.mutate(id);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <AdminLayout title={t("admin.investments.manage")}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t("admin.investments.manage")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.investments.manageDescription")}
          </p>
        </div>
        <Button onClick={() => setLocation("/admin/investments/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.investments.addNew")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {investments?.map((investment) => (
          <Card key={investment.id} className="overflow-hidden">
            <div className="relative aspect-video">
              {investment.imageUrl ? (
                <img
                  src={investment.imageUrl}
                  alt={investment.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Image className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="pt-4">
              <div className="mb-4">
                <CardTitle className="text-lg mb-1">{investment.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {investment.description}
                </CardDescription>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Type:</span>{" "}
                  {investment.type === "real_estate" ? "Real Estate" : "Business"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Category:</span>{" "}
                  {investment.category}
                </div>
                <div className="text-sm">
                  <span className="font-medium">ROI:</span>{" "}
                  {investment.expectedRoi}%
                </div>
                <div className="text-sm">
                  <span className="font-medium">Price per Token:</span>{" "}
                  ₽{Number(investment.pricePerToken).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setLocation(`/admin/investments/${investment.id}`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(investment.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}