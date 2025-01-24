import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layouts/admin-layout";
import type { Investment } from "@db/schema";
import { useI18n } from "@/lib/i18n/context";

export default function AdminInvestments() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { t } = useI18n();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: investments, isLoading } = useQuery<Investment[]>({
    queryKey: ['/api/investments'],
  });

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
          <Card key={investment.id}>
            <CardHeader className="relative">
              <img
                src={investment.imageUrl}
                alt={investment.name}
                className="absolute inset-0 h-full w-full object-cover rounded-t-lg"
              />
              <div className="relative pt-48"></div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <CardTitle className="text-lg mb-1">{investment.name}</CardTitle>
                <CardDescription>{investment.description}</CardDescription>
              </div>
              <div className="flex gap-2">
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
