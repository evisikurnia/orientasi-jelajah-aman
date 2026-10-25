// src/components/AtribusiCuaca.tsx
import { Text, TouchableOpacity, Linking } from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function AtribusiCuaca() {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={() => Linking.openURL("https://open-meteo.com/")}>
      <Text style={{ fontSize: 11, color: colors.subtext, textAlign: "center" }}>
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}