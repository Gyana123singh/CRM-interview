import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function GET() {
  return new Promise((resolve) => {
    const backendPath = path.resolve("../Backend");
    const env = { ...process.env, PATH: `${process.env.PATH};C:\\Program Files\\nodejs` };

    console.log("Next.js executing host prisma push & build...");
    
    // Run prisma push first, then generate, then build backend tsc
    exec("npx prisma db push && npx prisma generate && npm run build", { cwd: backendPath, env }, (error, stdout, stderr) => {
      if (error) {
        console.error("Host compilation failed:", error);
        resolve(NextResponse.json({ error: error.message, stdout, stderr }, { status: 500 }));
      } else {
        console.log("Host compilation succeeded:", stdout);
        resolve(NextResponse.json({ message: "Host compilation succeeded", stdout }));
      }
    });
  });
}
