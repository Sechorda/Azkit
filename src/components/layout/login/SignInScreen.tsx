import { Card, Text, makeStyles, shorthands } from "@fluentui/react-components";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import SignInButton from "./SignInButton";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    position: "relative",
    overflow: "hidden"
  },
  card: {
    ...shorthands.padding("48px"),
    width: "400px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    boxShadow: `
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 10px 2px rgba(100, 149, 237, 0.1),
      0 0 20px 5px rgba(100, 149, 237, 0),
      0 16px 32px rgba(0, 0, 0, 0.3)
    `,
    animationName: {
      "0%": {
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 10px 2px rgba(100, 149, 237, 0.1),
          0 0 20px 5px rgba(100, 149, 237, 0),
          0 16px 32px rgba(0, 0, 0, 0.3)
        `
      },
      "50%": {
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 15px 3px rgba(100, 149, 237, 0.15),
          0 0 25px 5px rgba(100, 149, 237, 0.05),
          0 16px 32px rgba(0, 0, 0, 0.3)
        `
      },
      "100%": {
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 0 10px 2px rgba(100, 149, 237, 0.1),
          0 0 20px 5px rgba(100, 149, 237, 0),
          0 16px 32px rgba(0, 0, 0, 0.3)
        `
      }
    },
    animationDuration: "6s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
    ...shorthands.borderRadius("16px"),
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    fontSize: "42px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "48px",
    textShadow: "0 2px 8px rgba(255, 255, 255, 0.2)"
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  devLoginButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "rgba(0, 128, 0, 0.2)",
    color: "#00ff00",
    ...shorthands.border("1px", "solid", "#00ff00"),
    ...shorthands.padding("8px", "16px"),
    ...shorthands.borderRadius("4px"),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(0, 128, 0, 0.3)"
    }
  }
});

export default function SignInScreen() {
  const styles = useStyles();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();

  const handleDevLogin = () => {
    sessionStorage.setItem('devMode', 'true');
    window.location.href = '/dashboard';
  };

  if (isAuthenticated) return null;

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <Text as="h1" className={styles.title}>Azkit</Text>
        <div className={styles.buttonContainer}>
          <SignInButton />
        </div>
      </Card>
      <button 
        className={styles.devLoginButton}
        onClick={handleDevLogin}
      >
        Dev Login
      </button>
    </div>
  );
}
