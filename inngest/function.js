import { inngest } from "./client";
import prisma from "@/lib/prisma";

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "user.created" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email_addresses[0].email_address,
        name: `${user.first_name} ${user.last_name}`,
        image: user.image_url,
      },
    });
  }
);

export const syncUserUpdate = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "user.updated" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email_addresses[0].email_address,
        name: `${user.first_name} ${user.last_name}`,
        image: user.image_url,
      },
    });
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "user.deleted" },
  async ({ event }) => {
    await prisma.user.delete({
      where: { id: event.data.id },
    });
  }
);
