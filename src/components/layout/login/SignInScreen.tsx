import React, { useState, useMemo } from "react";
import { Card, Text, makeStyles, shorthands, Button, Checkbox, Spinner, Badge, Input } from "@fluentui/react-components";
import { DEFAULT_GRAPH_SCOPES, ALL_AVAILABLE_SCOPES, buildScopes } from "../../../lib/graphScopes";
import { psConnectWithScopes, psStatus, psRunLocal } from "../../../lib/psBackend";
import { ChevronRightRegular, ShieldCheckmarkRegular, ConnectedRegular, SearchRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    ...shorthands.padding("20px"),
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    backgroundColor: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    ...shorthands.padding("32px"),
    ...shorthands.borderRadius("20px"),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "28px",
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.1),
      0 20px 40px rgba(0,0,0,0.5),
      0 0 60px rgba(50,120,255,0.12)
    `,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    width: "100%",
  },
  title: {
    fontSize: "40px",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    textShadow: "0 2px 20px rgba(255,255,255,0.3)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    margin: 0,
    fontWeight: 400,
  },
  connectSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  primaryButton: {
    width: "100%",
    maxWidth: "320px",
    height: "56px",
    fontSize: "18px",
    fontWeight: 700,
    ...shorthands.borderRadius("16px"),
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ...shorthands.border("none"),
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
    transition: "all 300ms ease",
    ":hover": {
      boxShadow: "0 12px 40px rgba(102, 126, 234, 0.6)",
      transform: "translateY(-2px)",
    },
    ":active": {
      transform: "translateY(0px)",
      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
    },
  },
  connectionStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
    ...shorthands.padding("8px", "12px"),
    background: "rgba(76,175,80,0.15)",
    ...shorthands.borderRadius("20px"),
    ...shorthands.border("1px", "solid", "rgba(76,175,80,0.3)"),
  },
  permissionsSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  disclosureButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "rgba(255,255,255,0.04)",
    ...shorthands.border("1px", "solid", "rgba(255,255,255,0.08)"),
    ...shorthands.borderRadius("8px"),
    ...shorthands.padding("8px", "12px"),
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    fontWeight: 500,
    transition: "all 200ms ease",
    alignSelf: "center",
    ":hover": { 
      background: "rgba(255,255,255,0.08)",
      ...shorthands.border("1px", "solid", "rgba(255,255,255,0.15)"),
      color: "rgba(255,255,255,0.9)",
    }
  },
  disclosureContent: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  permissionIcon: {
    fontSize: "14px",
    color: "#4fc3f7",
  },
  chevronIcon: {
    fontSize: "12px",
    transition: "transform 200ms ease",
  },
  scopesPanel: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    ...shorthands.border("1px", "solid", "rgba(255,255,255,0.08)"),
    ...shorthands.borderRadius("12px"),
    ...shorthands.padding("0"),
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxHeight: 0,
    opacity: 0,
    transition: "max-height 500ms ease, opacity 400ms ease",
  },
  scopesPanelOpen: {
    maxHeight: "600px",
    opacity: 1,
    ...shorthands.padding("20px"),
  },
  searchContainer: {
    marginBottom: "16px",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "14px",
    ...shorthands.border("1px", "solid", "rgba(255,255,255,0.15)"),
    ":focus": {
      ...shorthands.border("1px", "solid", "rgba(0,120,255,0.5)"),
      backgroundColor: "rgba(255,255,255,0.12)",
    },
  },
  scopesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  allScopesList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    ...shorthands.padding("16px"),
    background: "rgba(0,0,0,0.25)",
    ...shorthands.borderRadius("8px"),
    maxHeight: "300px",
    overflowY: "auto",
  },
  scopeItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "rgba(255,255,255,0.9)",
    ...shorthands.padding("4px", "0"),
  },
  defaultScopeItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "rgba(76,175,80,0.9)",
    ...shorthands.padding("4px", "0"),
    fontWeight: 500,
  },
  scopeSummary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("12px", "16px"),
    background: "rgba(0,120,255,0.12)",
    ...shorthands.border("1px", "solid", "rgba(0,120,255,0.25)"),
    ...shorthands.borderRadius("8px"),
    fontSize: "13px",
    color: "#b3d9ff",
    marginTop: "8px",
  },
  devLoginButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    backgroundColor: "rgba(0,150,136,0.2)",
    color: "#26a69a",
    ...shorthands.border("1px", "solid", "rgba(38,166,154,0.4)"),
    ...shorthands.padding("10px", "16px"),
    ...shorthands.borderRadius("8px"),
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    transition: "all 200ms ease",
    ":hover": {
      backgroundColor: "rgba(0,150,136,0.3)",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
    },
  },
});

type GraphContext = {
  Account?: string;
  TenantId?: string;
  AppName?: string;
  Scopes?: string[];
};

export default function SignInScreen() {
  const styles = useStyles();

  // State management
  const [showScopes, setShowScopes] = useState(false);
  const [selectedOptional, setSelectedOptional] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState(false);
  const [graphCtx, setGraphCtx] = useState<GraphContext | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Get optional scopes (all scopes except defaults)
  const optionalScopes = ALL_AVAILABLE_SCOPES.filter(
    scope => !DEFAULT_GRAPH_SCOPES.includes(scope)
  );

  // Filter scopes based on search term
  const filteredOptionalScopes = useMemo(() => {
    if (!searchTerm) return optionalScopes;
    return optionalScopes.filter(scope => 
      scope.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, optionalScopes]);

  const effectiveScopes = buildScopes(selectedOptional);

  const toggleOptional = (scope: string, checked: boolean) => {
    setSelectedOptional(prev => {
      const next = new Set(prev);
      if (checked) next.add(scope); else next.delete(scope);
      return next;
    });
  };

  const connectGraph = async () => {
    setConnecting(true);
    setErr(null);
    setDebugLogs([]); // Clear previous logs

    addLog("🔄 Starting MgGraph connection (local)...");
    addLog(`📋 Selected ${effectiveScopes.length} scopes`);

    try {
      // Run Connect-MgGraph in the local PowerShell session via /local
      const cmd = `Connect-MgGraph -Scopes ${effectiveScopes.map(sc => '"' + sc + '"').join(',')} -NoWelcome`;
      addLog(`📡 Running local command: ${cmd}`);
      const local = await psRunLocal(cmd);
      addLog(`📡 Local response: ${JSON.stringify(local)}`);

      if (!local || !local.ok) {
        addLog(`⚠️ Local connect reported error: ${local?.error ?? JSON.stringify(local?.errors ?? local)}`);
        const out = local?.output && local.output.length ? JSON.stringify(local.output, null, 2) : (local?.error ?? (local?.errors ? local.errors.join('\n') : ''));
        setErr(out || 'Local connect failed. Check backend terminal for device code or errors.');
      }

      // Always check status after attempting local connect
      addLog("✅ Checking status after local connect...");
      const s = await psStatus();
      addLog(`📊 Status: ${JSON.stringify(s)}`);

      if (s && s.ok && s.connected && s.context) {
        addLog("✅ Graph context received!");
        setGraphCtx(s.context as GraphContext);
        window.location.href = "/dashboard";
        return;
      } else {
        addLog("⚠️ Not connected after local connect");
        if (!err) setErr("Not connected. If device-code was used, follow the code shown in the backend terminal or returned output.");
      }
    } catch (e: any) {
      addLog(`💥 Exception: ${e?.message}`);
      addLog(`💥 Stack: ${e?.stack}`);
      setErr(e?.message || "Connect failed");
    } finally {
      setConnecting(false);
      addLog("🏁 Connection attempt finished");
    }
  };

  const handleDevLogin = () => {
    sessionStorage.setItem("devMode", "true");
    window.location.href = "/dashboard";
  };

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
          <h1 className={styles.title}>Azkit</h1>
          <p className={styles.subtitle}>Microsoft Graph PowerShell Integration</p>
        </div>

        {/* Connection Section */}
        <div className={styles.connectSection}>
          <Button
            appearance="primary"
            className={styles.primaryButton}
            size="large"
            disabled={connecting}
            onClick={connectGraph}
          >
            {connecting ? (
              <>
                <Spinner size="tiny" />
                &nbsp;Connecting...
              </>
            ) : (
              <>
                <ConnectedRegular />
                &nbsp;{graphCtx ? "Reconnect MgGraph" : "Connect MgGraph"}
              </>
            )}
          </Button>

          {graphCtx && (
            <div className={styles.connectionStatus}>
              <ConnectedRegular style={{ color: "#4caf50" }} />
              Connected as {graphCtx.Account}
            </div>
          )}
        </div>

        {/* Permissions Section */}
        <div className={styles.permissionsSection}>
          <button
            className={styles.disclosureButton}
            onClick={() => setShowScopes(s => !s)}
            aria-expanded={showScopes}
            type="button"
          >
            <div className={styles.disclosureContent}>
              <ShieldCheckmarkRegular className={styles.permissionIcon} />
              Permission Scopes
              <Badge size="small" color="informative">
                {effectiveScopes.length}
              </Badge>
            </div>
            <ChevronRightRegular 
              className={styles.chevronIcon}
              style={{ transform: showScopes ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </button>

          <div className={`${styles.scopesPanel} ${showScopes ? styles.scopesPanelOpen : ""}`}>
            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <Input
                className={styles.searchInput}
                placeholder="Search permission scopes..."
                value={searchTerm}
                onChange={(_, data) => setSearchTerm(data.value)}
                contentBefore={<SearchRegular />}
              />
            </div>

            <div className={styles.scopesContainer}>
              {/* Single Combined Scopes List */}
              <div className={styles.sectionTitle}>
                <ShieldCheckmarkRegular style={{ color: "#4fc3f7" }} />
                All Permission Scopes
              </div>
              <div className={styles.allScopesList}>
                {/* Default scopes at top */}
                {DEFAULT_GRAPH_SCOPES.map(scope => (
                  <div key={scope} className={styles.defaultScopeItem}>
                    <Checkbox label={`${scope} (default)`} checked disabled size="medium" />
                  </div>
                ))}
                
                {/* Optional scopes below */}
                {filteredOptionalScopes.length > 0 ? (
                  filteredOptionalScopes.map(scope => {
                    const checked = selectedOptional.has(scope);
                    return (
                      <div key={scope} className={styles.scopeItem}>
                        <Checkbox
                          label={scope}
                          checked={checked}
                          onChange={(_, data) => toggleOptional(scope, !!data.checked)}
                          size="medium"
                        />
                      </div>
                    );
                  })
                ) : searchTerm ? (
                  <Text size={200} style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "16px" }}>
                    No scopes found matching "{searchTerm}"
                  </Text>
                ) : null}
              </div>

              {/* Scope Summary */}
              <div className={styles.scopeSummary}>
                <span>Total Scopes Selected</span>
                <Badge size="small" color="brand">{effectiveScopes.length}</Badge>
              </div>
            </div>
          </div>
        </div>

      </Card>
      
      {/* Dev Mode Button - Outside the card, fixed to screen */}
      <button
        className={styles.devLoginButton}
        onClick={handleDevLogin}
        type="button"
      >
        Dev Mode
      </button>
    </div>
  );
}
