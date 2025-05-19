
import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { router } from 'expo-router';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Text,
  Linking,
  ScrollView,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LanguageSelector from '../src/components/LanguageSelector';
import { getStoredLanguage, setStoredLanguage } from '../src/utils/languageUtils';

const { height, width } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round(height * 0.7);
const VIDEO_WIDTH = width;

interface VideoItem {
  id: string;
  uri: string;
  title?: string;
  language?: string;
  category?: string;
  source?: string;
  sourceUrl?: string;
  factCheck?: 'fact_checked' | 'pending';
  trustScore?: number;
  factSource?: string;
  factSummary?: string;
}

export default function VideoScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showUI, setShowUI] = useState(true);
  // hideUITimer removed
  const navigation = useNavigation();
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const loadLang = async () => {
      const storedLang = await getStoredLanguage();
      if (storedLang) {
        setLanguage(storedLang);
      } else {
        setShowLangSelector(true);
      }
    };
    loadLang();
  }, []);

  useEffect(() => {
    if (!language) return;
    const fetchVideos = async () => {
      setLoading(true);
      const videoRef = collection(db, 'videos');
      const q = query(videoRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetched: VideoItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as VideoItem;
        fetched.push({ ...data, id: doc.id });
      });

      const languageFiltered = fetched.filter((v) => v.language === language);
      setAvailableCategories(
        [...new Set(languageFiltered.map((v) => v.category || ''))].filter(Boolean)
      );
      const finalFiltered = languageFiltered.filter((v) =>
        category ? v.category === category : true
      );
      setVideos(finalFiltered);
      setLoading(false);
    };
    fetchVideos();
  }, [language, category]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      
    }
  });

  const handleLanguageSelect = async (lang: string) => {
    await setStoredLanguage(lang);
    setLanguage(lang);
    setShowLangSelector(false);
  };

const renderItem = ({ item, index }: { item: VideoItem; index: number }) => 
  {
  let embedUrl = item.uri;
  if (embedUrl.includes("watch?v=")) {
    const videoId = embedUrl.split("watch?v=")[1].split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1&playsinline=1&controls=0&rel=0&fs=0`;
  }

  const isYouTube = embedUrl.includes("youtube.com/embed");

  return (
    <TouchableWithoutFeedback onPress={() => setShowUI((prev) => !prev)}>
      <View style={{ height, width }}>
        <View style={{ height: VIDEO_HEIGHT, width: VIDEO_WIDTH, overflow: "hidden" }}>
          {isYouTube ? (
            <WebView
              source={{ uri: embedUrl }}
              style={{ height: VIDEO_HEIGHT, width: VIDEO_WIDTH }}
              javaScriptEnabled
              allowsFullscreenVideo={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          ) : (
            <Video
              source={{ uri: embedUrl }}
              style={{ height: VIDEO_HEIGHT, width: VIDEO_WIDTH }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={index === currentIndex}
              isLooping
            />
          )}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.titleText}>{item.title}</Text>
          {item.source && <Text style={styles.sourceText}>Source: {item.source}</Text>}
          {item.sourceUrl && (
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL(item.sourceUrl!)}
            >
              🔗 View Original
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};


  if (showLangSelector) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      (
        <ScrollView horizontal contentContainerStyle={styles.categoryContainer}>
          {availableCategories.map((cat) => (
            <Text
              key={cat}
              style={[styles.catButton, category === cat && styles.catButtonActive]}
              onPress={() => setCategory(category === cat ? '' : cat)}
            >
              {cat.toUpperCase()}
            </Text>
          ))}
        </ScrollView>
      );
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        removeClippedSubviews={true}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 80 }}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardMeta: {
    height: height * 0.3,
    backgroundColor: 'black',
    padding: 16,
    justifyContent: 'flex-start',
  },
  container: { flex: 1, backgroundColor: 'black' },
  video: {
    height: '100%',
    width: '100%',
  },
  titleText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  sourceText: { color: '#ccc', fontSize: 14 },
  linkText: {
    color: '#4da6ff',
    marginTop: 4,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  factChecked: {
    color: '#00ff99',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  factPending: {
    color: '#ffcc00',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  catButton: {
    color: '#ccc',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#222',
    marginRight: 8,
  },
  catButtonActive: {
    color: '#fff',
    backgroundColor: '#007aff',
    borderColor: '#007aff',
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
  
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
    footerLabel: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 2,
  },
});
