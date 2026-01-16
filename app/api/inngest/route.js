import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";   // your client
import { syncUserCreation, syncUserDeletion, syncUserUpdate } from "@/inngest/functions"; 
// or wherever your functions are actually stored

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdate
  ],
});