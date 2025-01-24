import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/context";
import { Lock, Plus } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthPage() {
  const [location] = useLocation();
  const isAdminLogin = location.includes("mode=admin");
  const { user, login } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await login(data);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Authentication failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (user) {
    if (user.role === 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Choose an action to proceed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => setLocation("/admin/investments/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Investment
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setLocation("/admin/dashboard")}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  }

  if (isAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Access admin control panel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="admin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Login to Admin Panel"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.username")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("common.loading") : t("common.login")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    const data = form.getValues();
                    try {
                      const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                        credentials: 'include',
                      });

                      if (!response.ok) {
                        throw new Error(await response.text());
                      }

                      await login(data);
                    } catch (error: any) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: error.message || "Registration failed",
                      });
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {t("common.register")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}