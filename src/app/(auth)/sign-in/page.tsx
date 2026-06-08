"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email:    form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email"    type="email"    placeholder="Email"    required />
      <input name="password" type="password" placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}