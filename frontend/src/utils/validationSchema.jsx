import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

