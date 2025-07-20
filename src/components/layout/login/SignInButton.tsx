import { handleSignIn } from "../../../lib/msal/helper";
import { Avatar, Button } from "@fluentui/react-components";

export default function SignInButton() {
  return (
    <Button
      size="large"
      shape="rounded"
      appearance="primary"
      style={{ 
        minWidth: "200px",
        columnGap: "12px",
        fontSize: "16px",
        fontWeight: "600",
        backgroundColor: "#0078d4",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.1),
          0 6px 20px rgba(0, 120, 212, 0.5),
          0 0 30px rgba(0, 120, 212, 0.3)
        `,
        ":hover": {
          backgroundColor: "#106ebe",
          boxShadow: "0 8px 24px rgba(0, 120, 212, 0.6)"
        }
      }}
      onClick={() => handleSignIn()}
    >
      Login with Azure
      <Avatar name={undefined} image={undefined} />
    </Button>
  );
}
