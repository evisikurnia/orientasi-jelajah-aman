// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  async function hapus(id: any) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => String(k.id) !== String(id)));
  }

  // Konfirmasi hapus yang mendukung HP (Mobile) dan Browser Web
  function konfirmasiHapus(id: any, namaKota: string) {
    const pesan = `Yakin hapus ${namaKota}?`;

    if (Platform.OS === "web") {
      // Untuk Browser (localhost:8081)
      const setuju = window.confirm(pesan);
      if (setuju) {
        hapus(id);
      }
    } else {
      // Untuk HP / Mobile (Android & iOS)
      Alert.alert("Konfirmasi Hapus", pesan, [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => hapus(id),
        },
      ]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>

      {/* Indikator jumlah favorit */}
      <Text style={{ color: "#666666", fontWeight: "600" }}>
        Tersimpan {daftarFavorit.length} kota
      </Text>

      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}

      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          <Text>{kota.nama}</Text>
          <Button
            title="Hapus"
            color="red"
            onPress={() => konfirmasiHapus(kota.id, kota.nama)}
          />
        </View>
      ))}
    </SafeAreaView>
  );
}