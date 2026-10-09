import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TentangScreen() {
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  content: {
    gap: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
  },
  version: {
    fontSize: 14,
    color: '#666666',
  },
  author: {
    fontSize: 14,
    color: '#333333',
  },
});