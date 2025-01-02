"use server";

import prisma from "@/prisma/prisma";
import type RateValidator from "@/validator/rate-validator";
import { revalidatePath } from "next/cache";

async function deleteRate(id: number) {
  try {
    const result = await prisma.rate.delete({
      where: {
        id: id,
      },
    });

    if (result) {
      return {
        status: 200,
        message: "Rate deleted successfully",
      };
    }
    return {
      status: 400,
      message: "Rate not found",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Internal server error",
    };
  }
}

async function getRates() {
  return await prisma.rate.findMany({
    orderBy: {
      id: "desc",
    },
  });
}

async function getRate(id: number) {
  return await prisma.rate.findUnique({
    where: {
      id: id,
    },
  });
}

async function createRate(data: RateValidator) {
  try {
    const result = await prisma.rate.create({
      data: data,
    });

    if (result) {
      revalidatePath("/dashboard", "layout");

      return {
        status: 200,
        message: "Rate created successfully",
      };
    }
    return {
      status: 400,
      message: "Rate not created",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Internal server error",
    };
  }
}

async function updateRate(id: number, data: RateValidator) {
  try {
    const result = await prisma.rate.update({
      where: {
        id: id,
      },
      data: data,
    });

    if (result) {
      return {
        status: 200,
        message: "Rate updated successfully",
      };
    }
    return {
      status: 400,
      message: "Rate not updated",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Internal server error",
    };
  }
}

async function getLastRate() {
  return await prisma.rate.findFirst({
    orderBy: {
      id: "desc",
    },
  });
}
export { deleteRate, getRates, getRate, createRate, updateRate, getLastRate };
