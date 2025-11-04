import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import freighter from "@stellar/freighter-api";

export const FreighterDiagnostic = () => {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const checkStatus = async () => {
      const win = window as any;
      let isAllowedResult = null;
      
      try {
        isAllowedResult = await freighter.isAllowed();
      } catch (e) {
        isAllowedResult = { error: String(e) };
      }
      
      setStatus({
        hasFreighter: !!win.freighter,
        hasFreighterApi: !!win.freighterApi,
        freighterApiExists: typeof freighter !== 'undefined',
        isAllowedResult,
        windowKeys: Object.keys(win).filter((k: string) => k.toLowerCase().includes('freight')),
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
      });
    };
    
    // Check immediately
    checkStatus();
    
    // Check after a delay (in case extension loads late)
    setTimeout(checkStatus, 1000);
    setTimeout(checkStatus, 2000);
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <Card className="p-4 text-xs font-mono bg-muted/50 mb-4">
      <div className="font-bold mb-2">Freighter Diagnostic</div>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </Card>
  );
};
