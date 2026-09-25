import {userRepository} from "@/server/repositories/userRepository";
import {passwordResetTokenRepository} from "@/server/repositories/passwordResetTokenRepository";
import {hashPassword, verifyPassword} from "@/server/password";
import {prisma} from "@/server/prisma";
import {screenName} from "@/mocks/external/kycWatchlist";
import {sendTransactionalEmail} from "@/mocks/external/emailProvider";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes (Req. 3: prazo de expiração)
const DUMMY_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

/** Service — os quatro fluxos de autenticação (login, signup, forgot/reset password). */
export const authService = {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    // verifyPassword sempre roda, mesmo com hash fictício, pra não vazar por
    // tempo de resposta se a conta existe ou não — ver comentário original.
    const ok = verifyPassword(password, user?.passwordHash || DUMMY_HASH);
    if (!user || !ok) return { error: "invalid" as const };
    if (user.status === "Suspended") return { error: "suspended" as const };
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, accountType: user.accountType } };
  },

  validateSignup(name: string, email: string, password: string): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!name) errors.name = "Enter your full name.";
    if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address, e.g. name@domain.com.";
    if (password.length < 8 || !/\d/.test(password)) errors.password = "Use at least 8 characters including one number.";
    return errors;
  },

  async signup(name: string, email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) return { errors: { email: "An account with this email already exists." } };

    // Req. 3 / LGPD & fraud-prevention: watchlist AML/KYC externa (AIE) antes de ativar a conta.
    const kyc = screenName(name);
    if (kyc.matched) return { errors: { name: "We could not verify this account. Contact support." } };

    const now = new Date();
    const since = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    const lastAccess = now.toISOString().slice(0, 10);

    const user = await userRepository.create({
      id: "u" + Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: "Investor",
      status: "Active",
      perms: "Wallets, goals, market data",
      since,
      lastAccess,
      activityText: "Account created",
      activityWhen: `${lastAccess} ${now.toTimeString().slice(0, 5)}`,
    });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  async forgotPassword(email: string) {
    if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address, e.g. name@domain.com." };

    const user = await userRepository.findByEmail(email);
    let devToken: string | null = null;
    if (user) {
      const token = "prt" + Date.now() + Math.random().toString(36).slice(2, 8);
      const now = new Date();
      await passwordResetTokenRepository.create({
        id: "rst" + Date.now(),
        userId: user.id,
        token,
        expiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
        createdAt: now.toISOString(),
      });
      sendTransactionalEmail(email, "Reset your MyWallet password");
      devToken = token; // exposto só pra este protótipo renderizar um link funcional sem inbox real
    }
    return { ok: true as const, devToken };
  },

  async resetPassword(token: string, password: string) {
    if (password.length < 8 || !/\d/.test(password)) {
      return { errors: { password: "Use at least 8 characters including one number." } };
    }

    const record = await passwordResetTokenRepository.findByToken(token);
    if (!record) return { error: "This recovery link is invalid. Request a new one." };
    if (record.usedAt) return { error: "This recovery link has already been used. Request a new one." };
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return { error: "This recovery link has expired. Request a new one." };
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hashPassword(password) } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date().toISOString() } }),
    ]);
    return { ok: true as const };
  },
};
