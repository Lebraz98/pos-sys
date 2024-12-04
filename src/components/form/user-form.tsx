"use client";
import LoginValidator from "@/validator/login-validator";
import UserValidator from "@/validator/user-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

export default function page() {
  const { handleSubmit, control } = useForm<UserValidator>({
    resolver: zodResolver(UserValidator),
  });
  return <div></div>;
}
