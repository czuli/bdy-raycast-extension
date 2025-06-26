import {
  showToast,
  Toast,
  LaunchProps,
  getPreferenceValues,
} from "@raycast/api";
import { execSync } from "child_process";

interface Arguments {
  port: string;
}

interface Preferences {
  defaultPort: string;
}

export default function QuickHttpTunnel(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { port } = props.arguments;
  const preferences = getPreferenceValues<Preferences>();

  const targetPort = port || preferences.defaultPort || "3000";
  const localAddress = `localhost:${targetPort}`;

  async function createQuickTunnel() {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Creating HTTP tunnel...",
        message: `Tunneling ${localAddress}`,
      });

      const result = execSync(`bdy http ${localAddress}`, { encoding: "utf8" });

      // Extract URL from output if possible
      const urlMatch = result.match(/https?:\/\/[^\s]+/);
      const publicUrl = urlMatch ? urlMatch[0] : "Check terminal for URL";

      showToast({
        style: Toast.Style.Success,
        title: "Tunnel Created!",
        message: `Public URL: ${publicUrl}`,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create tunnel",
        message: "Make sure BDY is configured and the local service is running",
      });
    }
  }

  createQuickTunnel();

  return null;
}
