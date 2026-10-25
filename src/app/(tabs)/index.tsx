// src/app/(tabs)/index.tsx
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { tambahFavorit } from "../../services/favoritStorage";
import {
  tambahRiwayat,
  simpanCache,
  ambilCache,
} from "../../services/riwayatStorage";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  const { colors } = useTheme();
  const styles = useMemo(() => buatStyles(colors), [colors]);
  const params = useLocalSearchParams<{
    rid?: string;
    nama?: string;
    lat?: string;
    lon?: string;
    t?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [statusData, setStatusData] = useState<{
    judul: string;
    sub: string;
    tipe: "segar" | "usang";
  } | null>(null);

  const requestIdRef = useRef(0);

  const muatDataOffline = async () => {
    // Fungsi pembantu jika ingin memperbarui UI tersimpan
  };

  // Fungsi saat kota dipilih
  const pilihKota = async (kota: HasilGeocoding) => {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    setTeksCari("");
    setLoading(true);
    setPesanError("");

    const idSaatIni = ++requestIdRef.current;

    try {
      const dataCuaca = await ambilCuaca(kota.latitude, kota.longitude);
      const dataAQI = await ambilKualitasUdara(kota.latitude, kota.longitude);

      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
      setStatusData({
        judul: "Data Terbaru dari Internet",
        sub: "Diperbarui baru saja",
        tipe: "segar",
      });

      if (kota.id !== -1) {
        await tambahFavorit({
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        });
        // SIMPAN CACHE & RIWAYAT
        await simpanCache(kota.id, dataCuaca, dataAQI);
        await tambahRiwayat({
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        });
        await muatDataOffline();
      }
    } catch (err) {
      // Offline mode -> ambil dari cache
      const cache = kota.id !== -1 ? await ambilCache(kota.id) : null;
      if (idSaatIni !== requestIdRef.current) return;

      if (cache) {
        setCuaca(cache.cuaca);
        setKualitasUdara(cache.kualitasUdara);
        setStatusData({
          judul: "Mode offline - data tersimpan mungkin sudah usang",
          sub: `Terakhir diperbarui ${new Date(cache.disimpanPada).toLocaleString("id-ID")}`,
          tipe: "usang",
        });
      } else {
        setPesanError(
          "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
        );
      }
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Dipicu saat item riwayat diklik di tab Riwayat
  useEffect(() => {
    if (params.rid && params.nama && params.lat && params.lon) {
      pilihKota({
        id: Number(params.rid),
        name: params.nama,
        latitude: Number(params.lat),
        longitude: Number(params.lon),
        country: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.t]);

  const tanganiCari = async () => {
    if (!teksCari.trim()) return;
    setLoading(true);
    setPesanError("");
    try {
      const hasil = await cariKota(teksCari);
      setHasilPencarian(hasil);
    } catch {
      setPesanError("Gagal mencari kota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Box Pencarian */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.card,
            color: colors.text,
            paddingHorizontal: 12,
            borderRadius: 4,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          placeholder="Cari nama kota..."
          placeholderTextColor={colors.subtext}
          value={teksCari}
          onChangeText={setTeksCari}
        />
        <TouchableOpacity
          style={[styles.btnBlue, !teksCari.trim() && styles.btnDisabled]}
          onPress={tanganiCari}
          disabled={!teksCari.trim() || loading}
        >
          <Text style={styles.btnBlueText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {/* Hasil Pencarian List */}
      {hasilPencarian.length > 0 && (
        <View style={{ backgroundColor: colors.card, padding: 8, borderRadius: 4 }}>
          <Text style={styles.sectionTitle}>Hasil Pencarian:</Text>
          {hasilPencarian.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.cityItem}
              onPress={() => pilihKota(item)}
            >
              <Text style={styles.cityNameText}>
                {item.name}, {item.country}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 12 }} />}

      {/* Banner Status Data */}
      {statusData && (
        <View
          style={[
            styles.cacheBanner,
            statusData.tipe === "segar" ? styles.bannerSegar : styles.bannerUsang,
          ]}
        >
          <Text
            style={[
              styles.cacheTitle,
              statusData.tipe === "segar" ? styles.textSegarTitle : styles.textUsangTitle,
            ]}
          >
            {statusData.judul}
          </Text>
          <Text
            style={[
              styles.cacheSub,
              statusData.tipe === "segar" ? styles.textSegarSub : styles.textUsangSub,
            ]}
          >
            {statusData.sub}
          </Text>
        </View>
      )}

      {/* Pesan Error */}
      {pesanError !== "" && (
        <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 4 }}>
          <Text style={styles.errorText}>{pesanError}</Text>
        </View>
      )}

      {/* Tampilan Data Cuaca */}
      {kotaTerpilih && cuaca && (
        <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 8, gap: 6 }}>
          <Text style={styles.boldText}>{kotaTerpilih.name}</Text>
          <Text style={styles.infoText}>Suhu: {cuaca.saatIni.suhu}°C</Text>
    <Text style={styles.infoText}>Kecepatan Angin: {cuaca.saatIni.kecepatanAngin} km/h</Text>
    {kualitasUdara && (
      <Text style={styles.infoText}>Indeks AQI: {kualitasUdara.indeksAQI}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// Styling Dinamis Berbasis Theme
const buatStyles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { padding: 16, gap: 10 },
    btnBlue: { backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 4, alignItems: "center" },
    btnDisabled: { backgroundColor: c.disabled },
    btnBlueText: { color: "#ffffff", fontWeight: "bold", fontSize: 14, letterSpacing: 0.5 },
    foundText: { fontSize: 14, color: c.text, marginTop: 4 },
    sectionTitle: { fontWeight: "bold", fontSize: 14, color: c.text, marginVertical: 6 },
    cityItem: { paddingVertical: 6 },
    cityNameText: { fontSize: 15, color: c.text },
    cacheBanner: { padding: 12, borderRadius: 8, marginVertical: 4 },
    bannerSegar: { backgroundColor: c.successBg },
    bannerUsang: { backgroundColor: c.warnBg },
    cacheTitle: { fontWeight: "bold", fontSize: 13 },
    textSegarTitle: { color: c.successText },
    textUsangTitle: { color: c.warnText },
    cacheSub: { fontSize: 12 },
    textSegarSub: { color: c.successText },
    textUsangSub: { color: c.warnText },
    infoText: { fontSize: 13, color: c.subtext },
    boldText: { fontSize: 15, fontWeight: "bold", color: c.text },
    errorText: { color: c.danger, fontSize: 14, lineHeight: 20 },
  });