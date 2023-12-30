import authOptions from "./auth-options";
import NextAuth from "next-auth";

export default async function auth(req: any, res: any) {
  const isDefaultSigninPage = req.method === "GET" && req.query.nextauth.includes("signin");
  //   // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop();
  }
  return await NextAuth(req, res, authOptions);
}
