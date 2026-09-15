import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LaporanUdara } from "../../../types/cuaca";

export default function IndikatorAQI(data: LaporanUdara) {
  const getWarnaAQI = (tingkat: LaporanUdara["tingkat"]) => {
    switch (tingkat) {
      case "BAIK":
        return "#22C55E"; // Hijau
      case "SEDANG":
        return "#EAB308"; // Kuning
      case "TIDAK_SEHAT":
        return "#EF4444"; // Merah
      case "BERBAHAYA":
        return "#7E22CE"; // Ungu
      default:
        return "#64748B";
    }
  };

  const warna = getWarnaAQI(data.tingkat);

  return (
    <View style={[styles.card, { borderColor: warna }]}>
      <Text style={styles.kota}>{data.kota}</Text>
      <Text style={[styles.tingkat, { color: warna }]}>
        {data.tingkat} (AQI: {data.indeksAQI})
      </Text>
      {data.diperbaruiPada && (
        <Text style={styles.waktu}>Diperbarui: {data.diperbaruiPada}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginTop: 12,
  },
  kota: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  tingkat: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 4,
  },
  waktu: {
    fontSize: 12,
    color: "#64748B",
  },
});