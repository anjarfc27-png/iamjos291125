import os from "os";
import { publicEnv } from "@/lib/env";
import { SystemInformationClient } from "./system-information-client";
import { SystemInformationHeader } from "./system-information-header";

export default function SystemInformationPage() {
  const nodeVersion = process.version;
  const osInfo = `${os.type()} ${os.release()}`;
  const dbInfo = "PostgreSQL (Supabase)";
  const webServer = "Next.js / Node.js";
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar - Light Gray */}
      <SystemInformationHeader />

      {/* Content */}
      <div className="px-6 py-6" style={{
        padding: '2rem 1.5rem'
      }}>
        <SystemInformationClient 
          nodeVersion={nodeVersion}
          osInfo={osInfo}
          dbInfo={dbInfo}
          webServer={webServer}
          supabaseUrl={supabaseUrl}
        />
      </div>
    </div>
  );
}


