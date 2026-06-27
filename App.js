// Tes GitHub Push
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://fakestoreapi.com/products';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL);
      setProducts(response.data || []);
    } catch (err) {
      setError('Gagal mengambil data. Periksa koneksi internet Anda.');
      console.log('Gagal fetch products:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map((item) => item.category)))];

  const filteredProducts = products.filter((item) => {
    const query = search.toLowerCase();
    const title = item.title ? item.title.toLowerCase() : '';
    const category = item.category ? item.category.toLowerCase() : '';
    const matchesSearch = title.includes(query) || category.includes(query);
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => setSelectedProduct(item)}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>HOT</Text>
      </View>
      <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
      <Text style={styles.productTitle}>{item.title}</Text>
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>REST API App</Text>
        <Text style={styles.title}>🛍️ ShopCatalog Lite</Text>
        <Text style={styles.subtitle}>
          Jelajahi produk dari Fake Store dengan pencarian, refresh, dan detail item.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Cari produk atau kategori"
          placeholderTextColor="#8d8d8d"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.chipRow}>
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {category === 'all' ? 'Semua' : category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && !refreshing && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6a5acd" />
          <Text style={styles.infoText}>Memuat produk...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>😢 {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryText}>🔄 Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#6a5acd"]}
                tintColor="#6a5acd"
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tidak ada produk yang cocok</Text>
            <Text style={styles.emptyText}>Coba ubah kata kunci atau kategori.</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setSearch('');
                setActiveCategory('all');
              }}
            >
              <Text style={styles.retryText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        )
      )}

      <Modal visible={!!selectedProduct} transparent animationType="slide" onRequestClose={() => setSelectedProduct(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedProduct && (
              <>
                <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} resizeMode="contain" />
                <Text style={styles.modalTitle}>{selectedProduct.title}</Text>
                <Text style={styles.modalCategory}>{selectedProduct.category}</Text>
                <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                <View style={styles.modalMetaRow}>
                  <Text style={styles.modalPrice}>${selectedProduct.price}</Text>
                  <Text style={styles.modalRating}>⭐ {selectedProduct.rating?.rate ?? 'n/a'}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.closeBtnText}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff',
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
  },
  eyebrow: {
    color: '#e7dcff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#f0eaff',
  },
  searchBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3d9ff',
  },
  input: {
    height: 46,
    fontSize: 15,
    color: '#222',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#ece5ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#6a5acd',
  },
  chipText: {
    color: '#4e3aa5',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginTop: 8,
    color: '#555',
    fontSize: 14,
  },
  errorText: {
    color: '#d63031',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#6a5acd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffefcc',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#c97a00',
    fontSize: 11,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    color: '#2e7d32',
    fontWeight: '700',
    fontSize: 15,
  },
  category: {
    fontSize: 12,
    color: '#8b7fd1',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 13,
    color: '#6a5acd',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
  },
  modalRating: {
    fontSize: 14,
    color: '#8b7fd1',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#6a5acd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
