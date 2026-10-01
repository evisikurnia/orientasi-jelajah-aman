export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface DataCuaca {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
}

export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
  indeksAQI?: number; // baru: angka asli dari API, opsional
}

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatAQI;
  diperbaruiPada?: string;
}
