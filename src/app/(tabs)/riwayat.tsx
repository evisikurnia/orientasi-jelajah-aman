// src/app/(tabs)/riwayat.tsx
import { useState, useCallback, useMemo } from "react";
import {
  View, Text, Alert, Platform, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayat, ambilCache, hapusSemuaCacheCuaca, ItemRiwayat, CacheCuaca,
} from "../../services/riwayatCache";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const { colors } = useTheme();
  const styles = useMemo(() => buatStyles(colors), [colors]);
  const router = useRouter();

  const [riwayat, setRiwayat] = useState<ItemRiwayat[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [cacheMap, setCacheMap] = useState<Record<string, CacheCuaca | null>>({});

  const muat = useCallback(async () => {
    const [r, f] = await Promise.all([ambilRiwayat(), ambilSemuaFavorit()]);
    setRiwayat(r);
    setDaftarFavorit(f);

    // ambil cache untuk semua id unik (riwayat + favorit)
    const semuaId = Array.from(
      new Set([...r.map((x) => String(x.id)), ...f.map((x) => String(x.id))])
    );
    const pasangan = await Promise.all(
      semuaId.map(async (id) => [id, await ambilCache(id)] as const)
    );
    setCacheMap(Object.fromEntries(pasangan));
  }, []);

  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat])
  );

  // Konfirmasi generik: web pakai window.confirm, mobile pakai Alert
  function konfirmasi(judul: string, pesan: string, labelOk: string, aksi: () => void) {
    if (Platform.OS === "web") {
      if (window.confirm(pesan)) aksi();
    } else {
      Alert.alert(judul, pesan, [
        { text: "Batal", style: "cancel" },
        { text: labelOk, style: "destructive", onPress: aksi },
      ]);
    }
  }

  // Klik riwayat/favorit -> buka Beranda dan otomatis cari kota tsb
  function bukaKota(id: number | string, nama: string, lat: number, lon: number) {
    router.push({
      pathname: "/",
      params: {
        rid: String(id),
        nama,
        lat: String(lat),
        lon: String(lon),
        t: String(Date.now()),
      },
    });
  }

  // Hapus CACHE (tugas 3)
  function konfirmasiHapusCache(id: number | string, nama: string) {
    konfirmasi(
      "Hapus Cache",
      `Hapus data cache cuaca untuk "${nama}" dari perangkat?`,
      "Hapus",
      async () => {
        await hapusSemuaCacheCuaca();
        await muat();
      }
    );
  }

  // Hapus FAVORIT (fitur lama, dipertahankan)
  function konfirmasiHapusFavorit(id: any, nama: string) {
    konfirmasi("Konfirmasi Hapus", `Yakin hapus ${nama}?`, "Hapus", async () => {
      await hapusFavorit(id);
      await hapusSemuaCacheCuaca(); // cache ikut dibersihkan
      await muat();
    });
  }

  function teksCache(id: number | string) {
    const c = cacheMap[String(id)];
    return c ? `${c.cuaca.saatIni.suhu}°C (tersimpan)` : "Tidak ada cache";
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ===== RIWAYAT PENCARIAN ===== */}
        <Text style={styles.judul}>Riwayat Pencarian</Text>
        <Text style={styles.indikator}>{riwayat.length} dari maks. 10 pencarian terakhir</Text>

        {riwayat.length === 0 && <Text style={styles.kosong}>Belum ada riwayat pencarian</Text>}

        {riwayat.map((k) => (
          <View key={`riwayat-${k.id}`} style={styles.baris}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => bukaKota(k.id, k.nama, k.latitude, k.longitude)}
            >
              <Text style={styles.nama}>{k.nama}</Text>
              <Text style={styles.sub}>{teksCache(k.id)}</Text>
            </TouchableOpacity>

            {cacheMap[String(k.id)] && (
              <TouchableOpacity
                onPress={() => konfirmasiHapusCache(k.id, k.nama)}
                hitSlop={10}
                accessibilityLabel={`Hapus cache ${k.nama}`}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* ===== KOTA FAVORIT ===== */}
        <Text style={[styles.judul, { marginTop: 20 }]}>Kota Favorit</Text>
        <Text style={styles.indikator}>Tersimpan {daftarFavorit.length} kota</Text>

        {daftarFavorit.length === 0 && <Text style={styles.kosong}>Belum ada kota favorit</Text>}

        {daftarFavorit.map((k) => (
          <View key={`fav-${k.id}`} style={styles.baris}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => bukaKota(k.id, k.nama, k.latitude, k.longitude)}
            >
              <Text style={styles.nama}>{k.nama}</Text>
              <Text style={styles.sub}>{teksCache(k.id)}</Text>
            </TouchableOpacity>

            {cacheMap[String(k.id)] && (
              <TouchableOpacity
                onPress={() => konfirmasiHapusCache(k.id, k.nama)}
                hitSlop={8}
                style={styles.aksi}
              >
                <Ionicons name="cloud-offline-outline" size={20} color={colors.subtext} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => konfirmasiHapusFavorit(k.id, k.nama)}
              hitSlop={8}
              style={styles.aksi}
            >
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const buatStyles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 8 },
    judul: { fontSize: 18, fontWeight: "bold", color: c.text },
    indikator: { color: c.subtext, fontWeight: "600" },
    kosong: { color: c.subtext },
    baris: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      backgroundColor: c.card,
      borderColor: c.border,
    },
    nama: { fontSize: 15, fontWeight: "600", color: c.text },
    sub: { fontSize: 12, color: c.subtext, marginTop: 2 },
    aksi: { marginLeft: 14 },
  });