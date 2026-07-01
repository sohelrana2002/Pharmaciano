/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.config";

// Reusable middleware to cache GET requests automatically
export const redisCache = (ttl: number = 300) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    // Cache only safe GET request
    if (req.method !== "GET") return next();

    // Generate a unique key based on the request URL route
    const cacheKey = `express:cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        console.log(`[Cache hit] Serving route from Redis: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      // If cache miss; save the data automatically
      const orginalJson = res.json;
      res.json = function (body: any): Response {
        res.json = orginalJson;

        // Save the redis asynchronously
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(body))
            .catch((err) => {
              console.error("Redis intercept saving error: ", err);
            });
        }

        return orginalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error: ", error);
      next();
    }
  };
};
