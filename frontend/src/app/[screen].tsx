import { Redirect, useLocalSearchParams } from "expo-router";
import App from "../../App";

export default function Screen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  if (!["events", "alerts", "sources"].includes(screen))
    return <Redirect href="/" />;
  return <App />;
}
