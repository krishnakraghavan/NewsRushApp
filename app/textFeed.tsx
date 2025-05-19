
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, SafeAreaView, TouchableWithoutFeedback, Image, Modal
} from 'react-native';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function TextFeedScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [initialUrl, setInitialUrl] = useState('');
  const webViewRef = useRef(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const ref = collection(db, 'textNews');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(data);
      } catch (error) {
        console.error('Error fetching text news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const toggleExpand = (id) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const openWebView = (url) => {
    setWebViewUrl(url);
    setInitialUrl(url);
    setWebViewVisible(true);
  };

  const handleNavChange = (navState) => {
    if (navState.url !== initialUrl && webViewRef.current) {
      webViewRef.current.stopLoading();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {articles.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }}
                style={styles.thumbnail}
              />
              <Text style={styles.category}>{item.category?.toUpperCase()}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>

              <View style={styles.metaRow}>
                {item.factChecked ? (
                  <Text style={styles.factChecked}>✅ Fact Checked</Text>
                ) : (
                  <Text style={styles.notChecked}>⚠️ Not Verified</Text>
                )}
                {item.factChecked && (
                  <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                    <Text style={styles.expandIcon}>ℹ️</Text>
                  </TouchableOpacity>
                )}
              </View>

              {expandedItemId === item.id && item.factChecked && (
                <View style={styles.factDetails}>
                  <Text style={styles.factText}>Trust Score: {item.trustScore}/100</Text>
                  <Text style={styles.factText}>Source: {item.factSource}</Text>
                  <Text style={styles.factText}>Summary: {item.factSummary}</Text>
                </View>
              )}

              {item.source && (
                <Text style={styles.source}>
                  {item.source} • {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                </Text>
              )}
              {item.sourceUrl && (
                <TouchableOpacity onPress={() => openWebView(item.sourceUrl)}>
                  <Text style={styles.readMore}>Read More ↗</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={webViewVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <TouchableOpacity onPress={() => setWebViewVisible(false)} style={{ padding: 10 }}>
            <Text style={{ color: '#4da6ff', fontSize: 16 }}>⬅️ Back</Text>
          </TouchableOpacity>
          <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            onNavigationStateChange={handleNavChange}
          />
        </SafeAreaView>
      </Modal>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContainer: { paddingVertical: 12, paddingHorizontal: 14 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  category: { fontSize: 12, color: '#007aff', marginBottom: 4 },
  title: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  summary: { fontSize: 15, color: '#ddd', marginBottom: 10 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  factChecked: { fontSize: 13, color: '#00e676' },
  notChecked: { fontSize: 13, color: '#ff9100' },
  expandIcon: { fontSize: 16, color: '#4da6ff' },
  factDetails: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  factText: { color: '#ccc', fontSize: 13, marginBottom: 4 },
  source: { fontSize: 12, color: '#aaa' },
  readMore: {
    fontSize: 14,
    color: '#4da6ff',
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    zIndex: 10,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 22,
    color: '#fff',
  },
  footerLabel: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
  },
});
