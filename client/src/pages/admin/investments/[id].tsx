import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layouts/admin-layout";
import { insertInvestmentSchema, type Investment } from "@db/schema";
import { useI18n } from "@/lib/i18n/context";

export default function EditInvestment() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/investments/:id");
  const { user } = useUser();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = params?.id === "new";

  const { data: investment, isLoading } = useQuery<Investment>({
    queryKey: [`/api/investments/${params?.id}`],
    enabled: !isNew && !!params?.id,
  });

  const form = useForm({
    resolver: zodResolver(insertInvestmentSchema),
    defaultValues: investment || {
      name: "",
      description: "",
      translationKey: "",
      type: "real_estate",
      category: "new_conservative",
      location: "",
      expectedRoi: 0,
      pricePerToken: 0,
      currency: "RUB",
      totalTokens: 1000,
      availableTokens: 1000,
      level: 1,
      imageUrl: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (investment) {
      form.reset(investment);
    }
  }, [investment, form]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const response = await fetch(
        isNew ? "/api/investments" : `/api/investments/${params?.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      toast({
        title: "Success",
        description: isNew
          ? "Investment created successfully"
          : "Investment updated successfully",
      });
      setLocation("/admin/investments");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: typeof form.getValues) => {
    mutation.mutate(data);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <AdminLayout
      title={
        isNew ? t("admin.investments.addNew") : t("admin.investments.manage")
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="translationKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Translation Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new_conservative">
                        New Conservative
                      </SelectItem>
                      <SelectItem value="core_plus">Core Plus</SelectItem>
                      <SelectItem value="value_add">Value Add</SelectItem>
                      <SelectItem value="systematic">Systematic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedRoi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected ROI (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Token</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Tokens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/investments")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving..."
                : isNew
                ? "Create Investment"
                : "Update Investment"}
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
