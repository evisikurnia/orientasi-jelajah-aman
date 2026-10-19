// src/services/airQualityService.ts
export async function ambilKualitasUdara(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5`
    );
    
    if (!response.ok) {
      throw new Error("Gagal mengambil data kualitas udara");
    }

    const data = await response.json();
    return {
      indeksAQI: data.current?.us_aqi ?? 0,
      pm25: data.current?.pm2_5 ?? 0,
      pm10: data.current?.pm10 ?? 0,
    };
  } catch (error) {
    // Fallback data jika API AQI bermasalah agar aplikasi tidak crash
    return {
      indeksAQI: 0,
      pm25: 0,
      pm10: 0,
    };
  }
}