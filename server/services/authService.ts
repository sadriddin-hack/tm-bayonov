import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { User, UserRole } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tm_bayonov_mma_jwt_secret_tajikistan_2026';
const JWT_EXPIRES_IN = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export class AuthService {
  static login(email: string, passwordPlain: string): { user: Omit<User, 'passwordHash'>; token: string } {
    const database = db.get();
    const user = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Истифодабаранда бо ин почта ёфт нашуд (Пользователь не найден)');
    }

    const isMatch = bcrypt.compareSync(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Рамз нодуруст аст (Неверный пароль)');
    }

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return user without passwordHash
    const { passwordHash, ...userSafe } = user;
    return { user: userSafe, token };
  }

  static verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch {
      throw new Error('Сессия беэътибор аст (Недействительный токен)');
    }
  }

  static changePassword(userId: string, oldPassword: string, newPassword: string): void {
    db.mutate((data) => {
      const user = data.users.find((u) => u.id === userId);
      if (!user) {
        throw new Error('Истифодабаранда ёфт нашуд');
      }

      const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
      if (!isMatch) {
        throw new Error('Рамзи кӯҳна нодуруст аст');
      }

      if (newPassword.length < 6) {
        throw new Error('Рамзи нав бояд камаш 6 аломат бошад');
      }

      user.passwordHash = bcrypt.hashSync(newPassword, 10);
    });
  }

  static getAllUsers(): Omit<User, 'passwordHash'>[] {
    const data = db.get();
    return data.users.map(({ passwordHash, ...u }) => u);
  }
}
