import {z} from "zod";

export const WorkspaceSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    ownerId: z.string().uuid(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;