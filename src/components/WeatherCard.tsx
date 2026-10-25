// src/components/WeatherCard.tsx
import { View, Text } from "react-native";

import { WeatherCardProps, TingkatAQI } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";
import { useTheme } from "../context/ThemeContext";

// Warna AQI per mode agar tetap terbaca di latar terang maupun gelap
const warnaTerang: Record<TingkatAQI, string> = {
  BAIK: "green",
  SEDANG: "goldenrod",
  TIDAK_SEHAT: "orange",
  BERBAHAYA: "crimson",
};

const warnaGelap: Record<TingkatAQI, string> = {
  BAIK: "#4ADE80",
  SEDANG: "#FACC15",
  TIDAK_SEHAT: "#FB923C",
  BERBAHAYA: "#F87171",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { colors, isDark } = useTheme();
  const warnaPerTingkat = isDark ? warnaGelap : warnaTerang;

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: typeScale.judul, color: colors.text }}>
        {kota}
      </Text>
      <Text style={{ fontSize: 32, color: colors.text }}>{suhu}°C</Text>
      <Text style={{ color: warnaPerTingkat[tingkatAQI], fontSize: typeScale.isi }}>
        {teksAQI}
      </Text>
    </View>
  );
}