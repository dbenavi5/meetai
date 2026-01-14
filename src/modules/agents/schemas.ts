import z from "zod";

export const agentsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    instruction: z.string().min(1, { message: "Instructions required" }),
})

export const agentsUpdateSchema = agentsInsertSchema.extend({
    id: z.string().min(1, { message: "ID is required" }),
})

// export const agentsDeleteSchema = z.object({
//     id: z.string().min(1, { message: "ID is required" }),
// })