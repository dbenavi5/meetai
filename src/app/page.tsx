"use client";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/**
 * Renders the main authentication UI, allowing users to sign up with email, name, and password, or log out if already authenticated.
 *
 * Displays a registration form for new users and shows the logged-in user's name with a logout option when authenticated.
 */
export default function Home() {
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp.email(
      {
        email,
        name,
        password,
      },
      {
        onSuccess: () => {
          window.alert("Success");
        },
        onError: () => {
          // display the error message
          window.alert("Something went wrong");
        },
      }
    );
  };

  if (session) {
    return (
      <div className="p-4 flex flex-col gap-y-4">
        <p>Logged in as {session.user.name}</p>
        <Button onClick={() => authClient.signOut()}>Logout</Button>
      </div>
    );
  }
  return (
    <div className="p-4 flex flex-col gap-4">
      <Input
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={onSubmit}>Create User</Button>
    </div>
  );
}
