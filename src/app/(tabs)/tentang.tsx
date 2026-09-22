import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typeScale, spacing } from '../../constants/styles';

export default function TentangScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 3. Terapkan accessibilityLabel pada judul */}
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
        <Text style={styles.author}>Pembuat: [Nama Anda]</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md, // Menggunakan spacing dari constants/styles
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: typeScale.header, // Menggunakan typeScale
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  content: {
    gap: spacing.sm,
  },
  appName: {
    fontSize: typeScale.subheader,
    fontWeight: '600',
  },
  version: {
    fontSize: typeScale.body,
    color: '#666666',
  },
  author: {
    fontSize: typeScale.body,
    color: '#333333',
  },
});