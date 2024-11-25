import { spawn } from "child_process";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  // Define the path to the Python script
  const pythonScriptPath = path.join(
    process.cwd(),
    "src",
    "scripts",
    "main.py"
  );

  // Spawn the Python process with the script path and data
  const pythonProcess = spawn("python", [pythonScriptPath, data]);

  return new Promise((resolve, reject) => {
    pythonProcess;

    let output = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(NextResponse.json({ output: output }));
    });
  });
}
