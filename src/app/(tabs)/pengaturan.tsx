// src/app/(tabs)/pengaturan.tsx
import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme, OpsiTema } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { hapusSemuaCacheCuaca } from "../../services/riwayatCache";

const PILIHAN_TEMA: { nilai: OpsiTema; label: string; ikon: keyof typeof Ionicons.glyphMap }[] = [
  { nilai: "light", label: "Terang", ikon: "sunny" },
  { nilai: "dark", label: "Gelap", ikon: "moon" },
  { nilai: "system", label: "Ikuti Sistem", ikon: "phone-portrait" },
];

export default function TabPengaturan() {
  const { modeTema, setModeTema, colors } = useTheme();
  const styles = useMemo(() => buatStyles(colors), [colors]);
  const [pesan, setPesan] = useState<string | null>(null);

  async function hapusDataTersimpan() {
    await hapusSemuaCache();
    await hapusSemuaCacheCuaca();
    setPesan("Data cuaca tersimpan sudah dihapus.");
  }

  // Konfirmasi sebelum hapus: web pakai window.confirm, mobile pakai Alert
  function konfirmasiHapus() {
    const teks = "Semua data cuaca tersimpan akan dihapus dari perangkat. Lanjutkan?";
    if (Platform.OS === "web") {
      if (window.confirm(teks)) hapusDataTersimpan();
    } else {
      Alert.alert("Hapus Data Cuaca", teks, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: hapusDataTersimpan },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.judul}>Jelajah Aman</Text>
      <Text style={styles.teks}>Versi 1.0.0</Text>

      {/* ===== MODE TAMPILAN ===== */}
      <Text style={[styles.subjudul, { marginTop: 12 }]}>Mode Tampilan</Text>
      {PILIHAN_TEMA.map((p) => {
        const aktif = modeTema === p.nilai;
        return (
          <TouchableOpacity
            key={p.nilai}
            onPress={() => setModeTema(p.nilai)}
            style={[
              styles.opsi,
              { borderColor: aktif ? colors.primary : colors.border },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: aktif }}
          >
            <Ionicons name={p.ikon} size={22} color={aktif ? colors.primary : colors.subtext} />
            <Text style={styles.opsiLabel}>{p.label}</Text>
            {aktif && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}

      {/* ===== DATA TERSIMPAN ===== */}
      <Text style={[styles.subjudul, { marginTop: 12 }]}>Data</Text>
      <TouchableOpacity style={styles.btnHapus} onPress={konfirmasiHapus}>
        <Text style={styles.btnHapusTeks}>HAPUS DATA CUACA TERSIMPAN</Text>
      </TouchableOpacity>
      {pesan && (
        <Text style={styles.pesan} accessibilityLabel={pesan}>
          {pesan}
        </Text>
      )}
    </SafeAreaView>
  );
}

const buatStyles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12, backgroundColor: c.background },
    judul: { fontSize: 18, fontWeight: "bold", color: c.text },
    subjudul: { fontSize: 15, fontWeight: "bold", color: c.text },
    teks: { color: c.subtext },
    opsi: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: c.card,
    },
    opsiLabel: { flex: 1, marginLeft: 12, color: c.text, fontSize: 15 },
    btnHapus: {
      backgroundColor: c.danger,
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: "center",
    },
    btnHapusTeks: { color: "#ffffff", fontWeight: "bold", fontSize: 14, letterSpacing: 0.5 },
    pesan: { color: c.successText },
  });