import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WishItem {
  id: string
  title: string
  price: number
  originalPrice?: number
  currency: string
  image?: string
  url: string
  brand?: string
  category?: string
  description?: string
  availability?: 'in_stock' | 'out_of_stock' | 'unknown'
  addedAt?: string
  updatedAt?: string
  tags?: string[]
  priceHistory?: PricePoint[]
}

export interface PricePoint {
  price: number
  date: string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 위시리스트 로드
  const loadWishlist = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'GET_WISHLIST'
      })
      
      if (response?.success) {
        items.value = response.data || []
      } else {
        error.value = response?.error || '위시리스트를 불러오는데 실패했습니다.'
      }
    } catch (err) {
      error.value = '위시리스트를 불러오는데 실패했습니다.'
      console.error('Error loading wishlist:', err)
    } finally {
      loading.value = false
    }
  }

  // 아이템 추가
  const addItem = async (item: Omit<WishItem, 'id' | 'addedAt'>) => {
    loading.value = true
    error.value = null
    
    try {
      const newItem: WishItem = {
        ...item,
        id: generateId(),
        addedAt: new Date().toISOString()
      }
      
      const response = await chrome.runtime.sendMessage({
        action: 'SAVE_WISHLIST_ITEM',
        data: newItem
      })
      
      if (response?.success) {
        items.value = response.data || []
        return newItem
      } else {
        error.value = response?.error || '아이템 추가에 실패했습니다.'
        return null
      }
    } catch (err) {
      error.value = '아이템 추가에 실패했습니다.'
      console.error('Error adding item:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 아이템 제거
  const removeItem = async (itemId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'REMOVE_WISHLIST_ITEM',
        data: { itemId }
      })
      
      if (response?.success) {
        items.value = items.value.filter(item => item.id !== itemId)
      } else {
        error.value = response?.error || '아이템 삭제에 실패했습니다.'
      }
    } catch (err) {
      error.value = '아이템 삭제에 실패했습니다.'
      console.error('Error removing item:', err)
    } finally {
      loading.value = false
    }
  }

  // 아이템 업데이트
  const updateItem = async (updatedItem: WishItem) => {
    loading.value = true
    error.value = null
    
    try {
      const itemWithUpdatedTime = {
        ...updatedItem,
        updatedAt: new Date().toISOString()
      }
      
      const response = await chrome.runtime.sendMessage({
        action: 'UPDATE_WISHLIST_ITEM',
        data: itemWithUpdatedTime
      })
      
      if (response?.success) {
        const index = items.value.findIndex(item => item.id === updatedItem.id)
        if (index >= 0) {
          items.value[index] = itemWithUpdatedTime
        }
      } else {
        error.value = response?.error || '아이템 업데이트에 실패했습니다.'
      }
    } catch (err) {
      error.value = '아이템 업데이트에 실패했습니다.'
      console.error('Error updating item:', err)
    } finally {
      loading.value = false
    }
  }

  // 브랜드별 아이템 가져오기
  const getItemsByBrand = (brand: string) => {
    return items.value.filter(item => item.brand === brand)
  }

  // 카테고리별 아이템 가져오기
  const getItemsByCategory = (category: string) => {
    return items.value.filter(item => item.category === category)
  }

  // 가격대별 아이템 가져오기
  const getItemsByPriceRange = (minPrice: number, maxPrice: number) => {
    return items.value.filter(item => 
      item.price >= minPrice && item.price <= maxPrice
    )
  }

  // 총 금액 계산
  const getTotalAmount = () => {
    return items.value.reduce((sum, item) => sum + item.price, 0)
  }

  // 브랜드 목록 가져오기
  const getBrands = () => {
    const brands = [...new Set(items.value.map(item => item.brand).filter(Boolean))]
    return brands.sort()
  }

  // 카테고리 목록 가져오기
  const getCategories = () => {
    const categories = [...new Set(items.value.map(item => item.category).filter(Boolean))]
    return categories.sort()
  }

  // 검색
  const searchItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return items.value.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.brand?.toLowerCase().includes(lowercaseQuery) ||
      item.category?.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery)
    )
  }

  // 아이템 존재 여부 확인 (URL 기반)
  const itemExists = (url: string) => {
    return items.value.some(item => item.url === url)
  }

  // 위시리스트 클리어
  const clearWishlist = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'CLEAR_WISHLIST'
      })
      
      if (response?.success) {
        items.value = []
      } else {
        error.value = response?.error || '위시리스트 초기화에 실패했습니다.'
      }
    } catch (err) {
      error.value = '위시리스트 초기화에 실패했습니다.'
      console.error('Error clearing wishlist:', err)
    } finally {
      loading.value = false
    }
  }

  // 위시리스트 내보내기
  const exportWishlist = () => {
    const dataStr = JSON.stringify(items.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `wishlist-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return {
    // State
    items,
    loading,
    error,
    
    // Actions
    loadWishlist,
    addItem,
    removeItem,
    updateItem,
    clearWishlist,
    exportWishlist,
    
    // Getters
    getItemsByBrand,
    getItemsByCategory,
    getItemsByPriceRange,
    getTotalAmount,
    getBrands,
    getCategories,
    searchItems,
    itemExists
  }
})

// 유틸리티 함수
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}