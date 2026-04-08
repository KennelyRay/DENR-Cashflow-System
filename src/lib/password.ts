import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(input: {
  password: string;
  passwordHash: string;
}) {
  return await bcrypt.compare(input.password, input.passwordHash);
}

