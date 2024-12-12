"use server";

import prisma from "@/prisma/prisma";
import type UserValidator from "@/validator/user-validator";
import type { error } from "console";

export async function createUser(data: UserValidator) {
  try {
    await prisma.user.create({
      data: {
        name: data.name,
        password: data.password,
        username: data.username,
        role: data.role,
      },
    });
  } catch (e) {
    return {
      error: "User already exists",
    };
  }
  return { message: "User created" };
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: {
      id: "asc",
    },
  });
}
