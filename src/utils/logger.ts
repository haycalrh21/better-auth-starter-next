// lib/UserLogger.ts
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

/**
 * Action types
 */
export enum LogAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
}

/**
 * Struktur data log
 */
export interface LogData<T = unknown> {
  userId?: string;
  action: LogAction;
  resource?: string;
  details?: Record<string, T>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Simpan log ke DB
 */
async function saveLog<T>(data: LogData<T>): Promise<void> {
  try {
    await prisma.userLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        resource: data.resource ?? null,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Failed to save log:", err);
  }
}

/**
 * Ambil IP + User Agent dari request
 */
export async function getRequestInfo(
  req?: NextRequest | Request
): Promise<{ ipAddress: string; userAgent: string }> {
  let ipAddress: string | null = null;

  // Ambil IP dari headers saja
  if (req) {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) ipAddress = fwd.split(",")[0]?.trim() || null;

    if (!ipAddress) {
      ipAddress = req.headers.get("x-real-ip");
    }
  } else {
    const h = await headers(); // harus await
    const fwd = h.get("x-forwarded-for");
    if (fwd) ipAddress = fwd.split(",")[0]?.trim() || null;
    if (!ipAddress) {
      ipAddress = h.get("x-real-ip");
    }
  }

  const ua = req ? req.headers.get("user-agent") || "unknown" : "unknown";
  return {
    ipAddress: ipAddress || "unknown",
    userAgent: ua,
  };
}

/**
 * Universal Logger
 */
export class UserLogger<T = unknown> {
  private readonly userId?: string;
  private ipAddress: string = "unknown";
  private userAgent: string = "unknown";

  private constructor(userId?: string) {
    this.userId = userId;
  }

  // Factory async untuk handle getRequestInfo
  static async create<T = unknown>(
    userId?: string,
    req?: NextRequest | Request
  ) {
    const logger = new UserLogger<T>(userId);
    const info = await getRequestInfo(req);
    logger.ipAddress = info.ipAddress;
    logger.userAgent = info.userAgent;
    return logger;
  }

  private async log(
    action: LogAction,
    resource?: string,
    details?: Record<string, T>
  ) {
    await saveLog({
      userId: this.userId,
      action,
      resource,
      details,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    });
  }

  // Auth
  async login() {
    await this.log(LogAction.LOGIN);
  }
  async logout() {
    await this.log(LogAction.LOGOUT);
  }

  // CRUD
  async create(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.CREATE, resource, details);
  }
  async update(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.UPDATE, resource, details);
  }
  async delete(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.DELETE, resource, details);
  }
  async view(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.VIEW, resource, details);
  }
  async export(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.EXPORT, resource, details);
  }
  async import(resource: string, details?: Record<string, T>) {
    await this.log(LogAction.IMPORT, resource, details);
  }
}
