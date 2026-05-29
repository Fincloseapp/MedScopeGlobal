"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error("route_error", error); }, [error]); return <main className="section"><div className="empty"><h1>Něco se pokazilo.</h1><p>Zachytili jsme chybu a můžete pokračovat opakováním akce.</p><button className="button primary" type="button" onClick={reset}>Zkusit znovu</button></div></main>; }
