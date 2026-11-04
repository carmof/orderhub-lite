import z from 'zod';

export const HelthCheckResponseSchema = z.object({
  status: z.string(),
});

export type HelthCheckResponse = z.infer<typeof HelthCheckResponseSchema>;
