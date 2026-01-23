import { clerkClient } from "@clerk/clerk-sdk-node";

export const authAdmin = async (userId) => {
  try {
    if (!userId) return false;

    const user = await clerkClient.users.getUser(userId);
    if (!user) return false;

    const admins =
      process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim()) || [];

    const userEmails = user.emailAddresses.map(e => e.emailAddress);

    return admins.some(email => userEmails.includes(email));
  } catch (error) {
    console.log("Admin Auth Error:", error);
    return false;
  }
};
