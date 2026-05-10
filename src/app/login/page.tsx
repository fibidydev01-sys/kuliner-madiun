"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { BRAND_NAME, TAGLINE } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    const supabase = createClient()

    // 1. Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error("Login gagal", {
        description:
          error.message === "Invalid login credentials"
            ? "Email atau password salah."
            : error.message,
      })
      setIsLoading(false)
      return
    }

    // 2. Verifikasi role super_admin
    const role = (data.user?.app_metadata as { role?: string })?.role
    if (role !== "super_admin") {
      await supabase.auth.signOut()
      toast.error("Akses ditolak", {
        description:
          "Akun ini bukan super admin. Hubungi pengelola untuk akses admin.",
      })
      setIsLoading(false)
      return
    }

    // 3. Sukses — redirect (handle redirect param via window for non-Suspense client)
    toast.success("Selamat datang!", {
      description: "Mengalihkan ke dashboard...",
    })

    const params = new URLSearchParams(window.location.search)
    const redirect = params.get("redirect") || "/admin"
    router.push(redirect)
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background via-background to-amber-50/30 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{BRAND_NAME}</h1>
          <p className="mt-1 text-xs italic text-muted-foreground">{TAGLINE}</p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="space-y-1.5">
            <CardTitle className="text-xl">Masuk Admin</CardTitle>
            <CardDescription>
              Khusus untuk operator. Calon pelanggan langsung ke peta tanpa login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@foodmap-madiun.com"
                          autoComplete="email"
                          autoFocus
                          disabled={isLoading}
                          {...field}
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Back to map */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Kembali ke peta
          </Link>
        </div>
      </div>
    </main>
  )
}
