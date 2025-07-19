// apps/node-server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { env } from "../env";

// Development helper to bypass authentication
const DEV_MODE = process.env.NODE_ENV === 'development';
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';

// Set a default orgId for development
const DEV_ORG_ID = "dev-org-id";

// Add known API keys for development
const DEV_API_KEYS: Record<string, string> = {
  "fx-fba279c1-4045-4dc2-8252-f7d2094156a6": DEV_ORG_ID
};

export const authenticatePublicRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // Extract token from Bearer header
    const token = authHeader?.split(" ")[1];
    if (!authHeader || !token || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Invalid or missing Bearer token",
      });
    }

    // In development mode with bypass auth
    if (DEV_MODE && BYPASS_AUTH) {
      console.log('⚠️ Development mode: Authentication bypassed');
      res.locals.orgId = DEV_ORG_ID;
      return next();
    }

    // In development mode, check for known API keys first
    if (DEV_MODE && token in DEV_API_KEYS) {
      console.log(`Using development API key: ${token}`);
      res.locals.orgId = DEV_API_KEYS[token];
      return next();
    }

    // Check if db.apiKey exists and is a function
    if (!db || !db.apiKey || typeof db.apiKey.findFirst !== 'function') {
      console.error('Database or apiKey model not properly initialized');

      if (DEV_MODE) {
        // In development, continue with a mock orgId
        console.log('⚠️ Development mode: Using mock orgId due to database error');
        res.locals.orgId = DEV_ORG_ID;
        return next();
      }

      return res.status(500).json({
        success: false,
        error: "Server configuration error: Database not available",
      });
    }

    try {
      // Try to find the API key in the database
      const apiKeyRecord = await db.apiKey.findFirst({
        where: {
          apiKey: token,
        },
      });

      if (!apiKeyRecord) {
        return res.status(401).json({
          success: false,
          error: "Invalid Bearer token",
        });
      }

      res.locals.orgId = apiKeyRecord.orgId;
      next();
    } catch (dbError) {
      console.error('Database query error:', dbError);

      if (DEV_MODE) {
        // In development, continue with a mock orgId
        console.log('⚠️ Development mode: Using mock orgId due to database error');
        res.locals.orgId = DEV_ORG_ID;
        return next();
      }

      return res.status(500).json({
        success: false,
        error: "Database error while validating authentication",
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);

    if (DEV_MODE) {
      // In development, continue with a mock orgId
      console.log('⚠️ Development mode: Using mock orgId due to error');
      res.locals.orgId = DEV_ORG_ID;
      return next();
    }

    return res.status(500).json({
      success: false,
      error: "Server error during authentication",
    });
  }
};

export const authenticateInternalRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-internal-secret"];

    // In development mode with bypass auth
    if (DEV_MODE && BYPASS_AUTH) {
      console.log('⚠️ Development mode: Internal authentication bypassed');
      return next();
    }

    // Check if the secret is set and matches
    if (!env.NODE_SERVER_SECRET) {
      console.error('NODE_SERVER_SECRET not set in environment');

      if (DEV_MODE) {
        // In development, allow access
        console.log('⚠️ Development mode: Allowing internal access without secret');
        return next();
      }

      return res.status(500).json({
        error: "Server configuration error: Internal secret not configured"
      });
    }

    if (apiKey !== env.NODE_SERVER_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.error('Internal authentication error:', error);

    if (DEV_MODE) {
      // In development, allow access
      console.log('⚠️ Development mode: Allowing internal access despite error');
      return next();
    }

    return res.status(500).json({ error: "Server error during authentication" });
  }
};

export const authenticateVapiRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-vapi-secret"];

    // In development mode with bypass auth
    if (DEV_MODE && BYPASS_AUTH) {
      console.log('⚠️ Development mode: Vapi authentication bypassed');
      return next();
    }

    // Check if the secret is set and matches
    if (!env.NODE_SERVER_SECRET) {
      console.error('NODE_SERVER_SECRET not set in environment');

      if (DEV_MODE) {
        // In development, allow access
        console.log('⚠️ Development mode: Allowing vapi access without secret');
        return next();
      }

      return res.status(500).json({
        error: "Server configuration error: Vapi secret not configured"
      });
    }

    if (apiKey !== env.NODE_SERVER_SECRET) {
      console.log("Unauthorized vapi request", apiKey, env.NODE_SERVER_SECRET);
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.error('Vapi authentication error:', error);

    if (DEV_MODE) {
      // In development, allow access
      console.log('⚠️ Development mode: Allowing vapi access despite error');
      return next();
    }

    return res.status(500).json({ error: "Server error during authentication" });
  }
};