import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, Image, Modal
} from 'react-native';

import { router } from 'expo-router';

export default function DigestScreen() {
  return (
  <View style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <Text style={styles.message}>📬 Your daily digest is coming soon.</Text>
    </SafeAreaView>
	  <View style={styles.footer}>
        <TouchableWithoutFeedback onPress={() => router.push('/digest')}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>📹</Text>
            <Text style={styles.footerLabel}>Digest</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => router.push('/video')}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>🏠</Text>
            <Text style={styles.footerLabel}>Home</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => router.push('/textFeed')}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>📰</Text>
            <Text style={styles.footerLabel}>Text Feed</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => router.push('/preferences')}>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>⚙️</Text>
            <Text style={styles.footerLabel}>Prefs</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
	</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
});