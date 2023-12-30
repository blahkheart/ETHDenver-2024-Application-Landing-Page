import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
// https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
// https://www.npmjs.com/package/nextjs-cors
import NextCors from "nextjs-cors";

export function withNextCors(handler: NextApiHandler): NextApiHandler {
  return async function nextApiHandlerWrappedWithNextCors(req: NextApiRequest, res: NextApiResponse) {
    const methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"];
    await NextCors(req, res, {
      methods,
      origin: "*",
      optionsSuccessStatus: 200,
    });

    return handler(req, res);
  };
}
