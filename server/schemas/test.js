import { loginSchema } from './auth.schema.js';

console.log(loginSchema.safeParse({
    email: "a@g.com",
    password: 'hello',
}));

console.log(loginSchema.safeParse({
    email:'abc',
    password: 1
}))