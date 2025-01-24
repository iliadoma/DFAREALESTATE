import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Plus, Settings, Package, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { t } = useI18n();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== "admin") return null;

  const adminMenuItems = [
    {
      title: "Add Investment",
      description: "Create a new investment opportunity",
      icon: Plus,
      href: "/admin/investments/new",
    },
    {
      title: "Manage Investments",
      description: "Edit or update existing investments",
      icon: Package,
      href: "/admin/investments",
    },
    {
      title: "File Manager",
      description: "Manage uploaded files and documents",
      icon: FileText,
      href: "/admin/files",
    },
    {
      title: "Settings",
      description: "Configure admin panel settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminMenuItems.map((item) => (
            <Card
              key={item.href}
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => setLocation(item.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
