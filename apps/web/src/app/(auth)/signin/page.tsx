"use client";

import React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  type: z.enum(["Miner", "User"]),
});

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

type Props = {};

const SignIn = (props: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      type: "User",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = await signIn('credentials', {
        redirect: true,
        callbackUrl: values.type === 'User' ? "/user" : "/mine",
        ...values
      })
      if (user?.error) {
        toast.error('There was some error')
        console.log("ONSUBMIT_ERROR", user.error)
      }
      toast.success("Successfully signed in")
    } catch (error) {
      console.log('CATCH_ONSUBMIT_ERROR', error)
    }
  }

  return (
    <Card className="w-[28vw]">
      <CardHeader>
        <CardTitle className="tracking-tight text-xl">
          Sign Up & Get Started
        </CardTitle>
        <CardDescription>Login to mine or send transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <Tabs defaultValue="user" className="-mt-2">
              <TabsList>
                <TabsTrigger onClick={() => {
                    form.setValue("type", "User")
                }} value="user">User</TabsTrigger>
                <TabsTrigger onClick={() => {
                    form.setValue("type", "Miner")
                }} value="miner">Miner</TabsTrigger>
              </TabsList>
              <TabsContent className="space-y-2" value="user">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="whysoshy" {...field} />
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
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent className="space-y-2" value="miner">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="whysoshy" {...field} />
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
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <Button type="submit">Sign in</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SignIn;
