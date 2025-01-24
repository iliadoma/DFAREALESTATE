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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/context";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setLocation("/admin");
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

  const onSubmit = async (data: FormData, isLogin: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(data);
      } else {
        await register(data);
      }
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

  if (isUserLoading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-6">
          <CardTitle>{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginDescription")}</CardDescription>

          {/* Admin/User Toggle */}
          <div className="flex gap-2 justify-center pt-4">
            <Button
              variant={!isAdminLogin ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAdminLogin(false)}
            >
              User Login
            </Button>
            <Button
              variant={isAdminLogin ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAdminLogin(true)}
            >
              Admin Login
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                {isAdminLogin ? "Admin Login" : t("common.login")}
              </TabsTrigger>
              {!isAdminLogin && (
                <TabsTrigger value="register">{t("common.register")}</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => onSubmit(data, true))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("common.username")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={isAdminLogin ? "Admin username" : "Username"} />
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
                          <Input type="password" {...field} placeholder={isAdminLogin ? "Admin password" : "Password"} />
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
                    {isSubmitting ? t("common.loading") : (isAdminLogin ? "Admin Login" : t("common.login"))}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {!isAdminLogin && (
              <TabsContent value="register">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => onSubmit(data, false))}
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t("common.loading") : t("common.register")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}