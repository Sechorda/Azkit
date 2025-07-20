import { handleSignOut } from "../../../lib/msal/helper";
import { Avatar, Button } from "@fluentui/react-components";

export default function SignOutButton() {
  return (
    <Button
      size="small"
      shape="square"
      appearance="primary"
      style={{ minWidth: 0, columnGap: "8px" }}
      onClick={() => handleSignOut()}
    >
      Sign Out
      <Avatar name={undefined} image={undefined} />
    </Button>
  );
}
