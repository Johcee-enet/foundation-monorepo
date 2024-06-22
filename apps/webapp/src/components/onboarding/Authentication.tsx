"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getErrorMsg } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "@acme/api/convex/_generated/api";

import { useToast } from "../ui/use-toast";
import { formSchema } from "./FormShema";

const Authentication = ({ login, refCode, type, tgInitData }: any) => {
  const router = useRouter();
  const { toast } = useToast();
  // Convex function to mutate lgoin and signup
  const signUp = useAction(api.onboarding.initializeNewUser);
  const loginUser = useAction(api.onboarding.loginUser);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      // referral: "",
    },
  });

  // Change password field value when login is toggled
  useEffect(() => {
    if (!login) {
      form.setValue("password", "");
    }
  }, [login]);

  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      console.log(values, ":::entry values");

      if (values.password) {
        // Call Login convex function
        const user = await loginUser({
          email: values.email,
          password: values?.password,
          type: type,
          tgInitData: tgInitData.toString()
        });
        // Set session before pushing
        localStorage.setItem(
          "fd-session",
          JSON.stringify({ userId: user?._id, isOnboarded: true }),
        );
        router.push(`/dashboard?userId=${user?._id}`);
      } else {
        // Call sign up convex function
        const userId = await signUp({
          email: values?.email.toLowerCase(),
          referreeCode: refCode ? refCode : undefined,
        });
        // Set session before pushing
        localStorage.setItem(
          "fd-session",
          JSON.stringify({ userId: userId, isOnboarded: false }),
        );
        // toast({
        //   title: "Onboarding",
        //   description: "OTP Sent to email",
        // });
        router.push(
          `/authentication/password?userId=${userId}`,
        );
      }
    } catch (err: any) {
      console.log(err, ":::Onboarding_error");
      const errMsg = getErrorMsg(err);
      toast({
        title: "Onboarding error",
        description: errMsg,
      });
      return;
    }
  }

  return (
    <div className="container md:max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="auth_input"
                    placeholder="Email"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {login && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="auth_input"
                      placeholder="Password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button className="btn" type="submit">
            {login ? type && type === "tg"? "Link Telegram" : "Login" : "Sign Up"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Authentication;
