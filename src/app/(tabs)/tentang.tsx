// src/app/(tabs)/tentang.tsx
import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";

export default function TentangScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => buatStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={styles.title}
        accessibilityLabel="Judul Halaman Tentang"
        accessibilityRole="header"
      >
        Tentang Aplikasi
      </Text>

      <View style={styles.content}>
        <Text style={styles.appName}>Aplikasi Kualitas Udara</Text>
        <Text style={styles.version}>Versi 1.0.0</Text>
        <Text style={styles.author}>Pembuat: Eka Visi Kurnia</Text>
      </View>

      {/* Opsional: info tambahan */}
      <View style={styles.kartu}>
        <Text style={styles.kartuJudul}>Sumber Data</Text>
        <Text style={styles.kartuTeks}>
          Data cuaca dan kualitas udara berasal dari Open-Meteo. Data yang pernah
          dibuka disimpan di perangkat sehingga tetap bisa dilihat saat offline.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const buatStyles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: c.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: c.text,
    },
    content: {
      gap: 8,
    },
    appName: {
      fontSize: 18,
      fontWeight: "600",
      color: c.text,
    },
    version: {
      fontSize: 14,
      color: c.subtext,
    },
    author: {
      fontSize: 14,
      color: c.text,
    },
    kartu: {
      marginTop: 24,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: c.card,
      borderColor: c.border,
      gap: 6,
    },
    kartuJudul: {
      fontSize: 15,
      fontWeight: "bold",
      color: c.text,
    },
    kartuTeks: {
      fontSize: 13,
      lineHeight: 19,
      color: c.subtext,
    },
  });