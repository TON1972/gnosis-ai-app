/**
 * 🔐 Gnosis.log - Sistema de Autenticação Proprietário
 * GNOSIS AI Platform
 * 
 * Sistema customizado de autenticação usando JWT + bcryptjs
 * 100% independente da Manus e compatível com Vercel
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

const SALT_ROUNDS = 10;

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Registrar novo usuário
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  try {
    const { email, password, name } = input;

    // Validações
    if (!email || !password) {
      return {
        success: false,
        message: "Email e senha são obrigatórios",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "A senha deve ter no mínimo 6 caracteres",
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Erro ao conectar ao banco de dados",
      };
    }

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        message: "Email já cadastrado",
      };
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Criar usuário
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      role: "user",
      loginMethod: "email",
    });

    const userId = Number((result as any).insertId);

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId,
        email,
        role: "user",
      } as JWTPayload,
      ENV.jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: userId,
        email,
        name: name || null,
        role: "user",
      },
    };
  } catch (error) {
    console.error("[Gnosis.log] Erro ao registrar:", error);
    return {
      success: false,
      message: "Erro ao criar conta. Tente novamente.",
    };
  }
}

/**
 * Login de usuário
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  try {
    const { email, password } = input;

    // Validações
    if (!email || !password) {
      return {
        success: false,
        message: "Email e senha são obrigatórios",
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Erro ao conectar ao banco de dados",
      };
    }

    // Buscar usuário
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        message: "Email ou senha incorretos",
      };
    }

    const user = userResult[0];

    // Verificar senha
    if (!user.password) {
      return {
        success: false,
        message: "Usuário sem senha cadastrada",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Email ou senha incorretos",
      };
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email!,
        role: user.role,
      } as JWTPayload,
      ENV.jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("[Gnosis.log] Erro ao fazer login:", error);
    return {
      success: false,
      message: "Erro ao fazer login. Tente novamente.",
    };
  }
}

/**
 * Verificar token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, ENV.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("[Gnosis.log] Token inválido:", error);
    return null;
  }
}
