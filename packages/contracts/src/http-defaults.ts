import z from 'zod';

export const problemResponseDtoSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string(),
});

export type ProblemResponseDto = z.infer<typeof problemResponseDtoSchema>;
