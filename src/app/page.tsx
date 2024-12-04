"use client";

import LoginValidator from "@/validator/login-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, PasswordInput, Text, TextInput } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
export default function Home() {
  const handleData = (values: LoginValidator) => {
    console.log(values);
  };

  const { handleSubmit, control } = useForm<LoginValidator>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(LoginValidator),
  });

  return (
    <Card
      onSubmit={handleSubmit(handleData)}
      component="form"
      style={{
        maxWidth: 350,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 50,
      }}
    >
      <Text>Sign in</Text>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextInput
            label="Username"
            {...field}
            placeholder="Username"
            withAsterisk
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <PasswordInput
            label="Password"
            {...field}
            placeholder="Password"
            withAsterisk
          />
        )}
      />

      <Button type="submit">Submit</Button>
    </Card>
  );
}
