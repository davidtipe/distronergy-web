"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiRequestError
            ? err.message
            : "Verification failed. The link may have expired."
        );
      });
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {status === "loading"
            ? "Verifying..."
            : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {status !== "loading" && (
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/login">Go to login</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
