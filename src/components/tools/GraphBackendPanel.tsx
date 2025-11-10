import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Text, Input, makeStyles, shorthands } from "@fluentui/react-components";
import type { StatusResult, LocalResult } from "../../lib/psBackend";
import { psStatus, psRunLocal } from "../../lib/psBackend";

const useStyles = makeStyles({
  root: {
    ...shorthands.margin("16px", "0"),
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  row: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  card: {
    ...shorthands.padding("12px"),
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pre: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#e6e6e6",
    ...shorthands.padding("8px"),
    ...shorthands.borderRadius("6px"),
    maxHeight: "280px",
    overflow: "auto",
    fontSize: "12px",
  },
  error: { color: "#ff6b6b" },
  ok: { color: "#20bf6b" },
});

const GraphBackendPanel: React.FC = () => {
  const styles = useStyles();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);
  const [localCommand, setLocalCommand] = useState<string>("$PSVersionTable");
  const [localResult, setLocalResult] = useState<LocalResult | null>(null);

  const refreshStatus = useCallback(async () => {
    setError(null);
    try {
      const res = await psStatus();
      setStatus(res);
    } catch (e: any) {
      setError(e?.message ?? "Status check failed");
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleConnect = async () => {
    setBusy(true);
    setError(null);
    try {
      // Run connect in the local PowerShell session using device code flow
      const cmd = `Connect-MgGraph -UseDeviceCode -NoWelcome`;
      const local = await psRunLocal(cmd);
      if (local && local.ok) {
        // refresh status to update UI
        await refreshStatus();
      } else {
        setError(local?.error ?? (local?.errors ? local.errors.join("\n") : "Local connect failed"));
      }
    } catch (e: any) {
      setError(e?.message ?? "Connect failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGetUsers = async () => {
    setBusy(true);
    setError(null);
    setUsers(null);
    try {
      const cmd = `Get-MgUser -Top 5 -Select id,displayName,userPrincipalName`;
      const res = await psRunLocal(cmd);
      if (res && res.ok) {
        const data = Array.isArray(res.output) ? res.output : (res.output ? [res.output] : []);
        setUsers(data);
      } else {
        setError(res?.error ?? (res?.errors ? res.errors.join("\n") : "Command failed"));
      }
    } catch (e: any) {
      setError(e?.message ?? "Command failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRunLocal = async () => {
    if (!localCommand.trim()) return;
    setBusy(true);
    setError(null);
    setLocalResult(null);
    try {
      const res = await psRunLocal(localCommand);
      setLocalResult(res);
      if (!res.ok) {
        setError(res.error ?? "Local command failed");
      }
    } catch (e: any) {
      setError(e?.message ?? "Local command failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSessionTest = async (testCommand: string) => {
    setLocalCommand(testCommand);
    // Small delay to ensure UI updates
    setTimeout(() => handleRunLocal(), 100);
  };

  return (
    <div className={styles.root}>
      <Text weight="semibold">PowerShell Graph Backend</Text>
      <div className={styles.row}>
        <Button appearance="primary" onClick={handleConnect} disabled={busy}>
          {busy ? "Working..." : "Connect (interactive)"}
        </Button>
        <Button onClick={refreshStatus} disabled={busy}>Refresh Status</Button>
        <Button onClick={handleGetUsers} disabled={busy || !status?.connected}>Get 5 Users</Button>
      </div>

      <Card className={styles.card}>
        <Text>
          Status:{" "}
          {status?.connected ? (
            <span className={styles.ok}>Connected</span>
          ) : (
            <span className={styles.error}>Disconnected</span>
          )}
        </Text>
        {status?.context && (
          <pre className={styles.pre}>{JSON.stringify(status.context, null, 2)}</pre>
        )}
      </Card>

      {error && (
        <Card className={styles.card}>
          <Text className={styles.error}>{error}</Text>
        </Card>
      )}

      {users && (
        <Card className={styles.card}>
          <Text weight="semibold">Users</Text>
          <pre className={styles.pre}>{JSON.stringify(users, null, 2)}</pre>
        </Card>
      )}

      {/* Local PowerShell Commands Section */}
      <Text weight="semibold">Local PowerShell Commands & Session Testing</Text>
      
      <div className={styles.row}>
        <Input
          value={localCommand}
          onChange={(e, data) => setLocalCommand(data.value)}
          placeholder="Enter PowerShell command..."
          style={{ minWidth: "300px", flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !busy) {
              handleRunLocal();
            }
          }}
        />
        <Button onClick={handleRunLocal} disabled={busy || !localCommand.trim()}>
          Run Command
        </Button>
      </div>

      <div className={styles.row}>
        <Text>Session Tests:</Text>
        <Button 
          size="small" 
          onClick={() => handleSessionTest('$testVar = "Session Test"; $testVar')}
          disabled={busy}
        >
          Set Variable
        </Button>
        <Button 
          size="small" 
          onClick={() => handleSessionTest('$testVar')}
          disabled={busy}
        >
          Get Variable
        </Button>
        <Button 
          size="small" 
          onClick={() => handleSessionTest('Get-Location')}
          disabled={busy}
        >
          Get Location
        </Button>
        <Button 
          size="small" 
          onClick={() => handleSessionTest('Get-MgContext | Select-Object Account, TenantId')}
          disabled={busy}
        >
          MgGraph Status
        </Button>
      </div>

      {localResult && (
        <Card className={styles.card}>
          <Text weight="semibold">
            Local Command Result {localResult.ok ? (
              <span className={styles.ok}>(Success)</span>
            ) : (
              <span className={styles.error}>(Failed)</span>
            )}
          </Text>
          
          {localResult.output && localResult.output.length > 0 && (
            <>
              <Text>Output:</Text>
              <pre className={styles.pre}>{JSON.stringify(localResult.output, null, 2)}</pre>
            </>
          )}
          
          {localResult.errors && localResult.errors.length > 0 && (
            <>
              <Text className={styles.error}>Errors:</Text>
              <pre className={styles.pre}>{localResult.errors.join('\n')}</pre>
            </>
          )}
          
          {localResult.warnings && localResult.warnings.length > 0 && (
            <>
              <Text style={{ color: "#ffa500" }}>Warnings:</Text>
              <pre className={styles.pre}>{localResult.warnings.join('\n')}</pre>
            </>
          )}
          
          {!localResult.ok && localResult.error && (
            <>
              <Text className={styles.error}>Error Details:</Text>
              <pre className={styles.pre}>{localResult.error}</pre>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default GraphBackendPanel;
