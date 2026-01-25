import { NextResponse } from "next/server";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    environment: HealthCheck;
  };
}

interface HealthCheck {
  status: "pass" | "warn" | "fail";
  message?: string;
  responseTime?: number;
}

const startTime = Date.now();

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Simple check - verify Supabase URL is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: "fail",
        message: "Database configuration missing",
      };
    }

    // Ping Supabase health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: supabaseKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - start;

    if (response.ok) {
      return {
        status: responseTime > 2000 ? "warn" : "pass",
        message: responseTime > 2000 ? "Slow response" : "Connected",
        responseTime,
      };
    }

    return {
      status: "fail",
      message: `Database returned ${response.status}`,
      responseTime,
    };
  } catch (error) {
    return {
      status: "fail",
      message: error instanceof Error ? error.message : "Connection failed",
      responseTime: Date.now() - start,
    };
  }
}

function checkMemory(): HealthCheck {
  try {
    // Node.js memory usage (only available in Node environment)
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

      if (usagePercent > 90) {
        return {
          status: "fail",
          message: `High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
        };
      }

      if (usagePercent > 70) {
        return {
          status: "warn",
          message: `Elevated memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
        };
      }

      return {
        status: "pass",
        message: `${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
      };
    }

    return {
      status: "pass",
      message: "Memory check not available in this environment",
    };
  } catch {
    return {
      status: "pass",
      message: "Memory check skipped",
    };
  }
}

function checkEnvironment(): HealthCheck {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      status: "fail",
      message: `Missing: ${missingVars.join(", ")}`,
    };
  }

  return {
    status: "pass",
    message: "All required environment variables present",
  };
}

function getOverallStatus(checks: HealthStatus["checks"]): HealthStatus["status"] {
  const statuses = Object.values(checks).map((check) => check.status);

  if (statuses.includes("fail")) {
    return "unhealthy";
  }

  if (statuses.includes("warn")) {
    return "degraded";
  }

  return "healthy";
}

export async function GET() {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    environment: checkEnvironment(),
  };

  const status: HealthStatus = {
    status: getOverallStatus(checks),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const httpStatus = status.status === "healthy" ? 200 : status.status === "degraded" ? 200 : 503;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

// HEAD request for simple health checks
export async function HEAD() {
  const envCheck = checkEnvironment();

  if (envCheck.status === "fail") {
    return new NextResponse(null, { status: 503 });
  }

  return new NextResponse(null, { status: 200 });
}
