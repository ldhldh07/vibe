<template>
  <div class="h-full flex flex-col">
    <!-- 검색 및 필터 -->
    <div class="bg-white p-4 border-b border-gray-200">
      <!-- 검색바 -->
      <div class="relative mb-3">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="상품명, 브랜드 검색..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>
      
      <!-- 필터 -->
      <div class="flex gap-2">
        <select v-model="selectedBrand" class="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">모든 브랜드</option>
          <option v-for="brand in uniqueBrands" :key="brand" :value="brand">
            {{ brand }}
          </option>
        </select>
        
        <select v-model="sortBy" class="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="addedAt">최신순</option>
          <option value="price">가격순</option>
          <option value="brand">브랜드순</option>
          <option value="title">이름순</option>
        </select>
      </div>
    </div>

    <!-- 위시리스트 아이템들 -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- 로딩 상태 -->
      <div v-if="wishlistStore.loading" class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
      
      <!-- 빈 상태 -->
      <div v-else-if="filteredItems.length === 0" class="flex flex-col items-center justify-center h-64 text-center px-6">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <HeartIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">위시리스트가 비어있어요</h3>
        <p class="text-sm text-gray-500 mb-4">쇼핑 사이트에서 하트 버튼을 눌러 상품을 추가해보세요!</p>
        <button 
          @click="addCurrentPage"
          class="btn btn-primary text-sm"
        >
          현재 페이지 추가하기
        </button>
      </div>
      
      <!-- 위시리스트 아이템들 -->
      <div v-else class="p-4 space-y-3">
        <WishItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @remove="removeItem"
          @update="updateItem"
        />
      </div>
    </div>

    <!-- 통계 정보 -->
    <div v-if="wishlistStore.items.length > 0" class="bg-white border-t border-gray-200 p-4">
      <div class="flex justify-between text-sm text-gray-600">
        <span>총 {{ wishlistStore.items.length }}개 상품</span>
        <span>총액 {{ formatPrice(totalAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  HeartIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { useWishlistStore } from '@/shared/stores/wishlist'
import WishItemCard from '@/shared/components/WishItemCard.vue'

const wishlistStore = useWishlistStore()

const searchQuery = ref('')
const selectedBrand = ref('')
const sortBy = ref('addedAt')

// 현재 탭 정보 가져오기 (플로팅 버튼과 동일한 로직)
const addCurrentPage = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.url && tab.id) {
      // 콘텐츠 스크립트에 직접 위시리스트 추가 요청 (플로팅 버튼과 동일)
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'ADD_TO_WISHLIST_FROM_POPUP'
        })
        // 성공 시 팝업 창 닫기
        window.close()
      } catch (error) {
        console.error('Error sending message to content script:', error)
        // 콘텐츠 스크립트 통신 실패 - 수동 입력
        await manualAddItem(tab)
      }
    }
  } catch (error) {
    console.error('Error getting current tab:', error)
    alert('현재 페이지를 추가할 수 없습니다.')
  }
}

// 수동 입력으로 아이템 추가
const manualAddItem = async (tab: chrome.tabs.Tab) => {
  const title = prompt('상품명을 입력해주세요:', tab.title) || tab.title
  const priceText = prompt('가격을 입력해주세요 (숫자만):', '0')
  const price = parseInt(priceText?.replace(/[^\d]/g, '') || '0')
  
  if (price > 0) {
    const hostname = new URL(tab.url!).hostname
    const brand = hostname.split('.')[0] || 'Unknown'
    
    const newItem = {
      id: Date.now().toString(),
      title,
      price,
      currency: 'KRW',
      url: tab.url!,
      brand,
      addedAt: new Date().toISOString()
    }
    
    await wishlistStore.addItem(newItem)
    alert('위시리스트에 추가되었습니다!')
  } else {
    alert('올바른 가격을 입력해주세요.')
  }
}

// 필터링된 아이템들
const filteredItems = computed(() => {
  let items = [...wishlistStore.items]
  
  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query)
    )
  }
  
  // 브랜드 필터
  if (selectedBrand.value) {
    items = items.filter(item => item.brand === selectedBrand.value)
  }
  
  // 정렬
  items.sort((a, b) => {
    switch (sortBy.value) {
      case 'price':
        return a.price - b.price
      case 'brand':
        return (a.brand || '').localeCompare(b.brand || '')
      case 'title':
        return a.title.localeCompare(b.title)
      default: // addedAt
        return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime()
    }
  })
  
  return items
})

// 고유 브랜드 목록
const uniqueBrands = computed(() => {
  const brands = [...new Set(wishlistStore.items.map(item => item.brand).filter(Boolean))]
  return brands.sort()
})

// 총 금액
const totalAmount = computed(() => {
  return wishlistStore.items.reduce((sum, item) => sum + item.price, 0)
})

// 아이템 제거
const removeItem = async (itemId: string) => {
  await wishlistStore.removeItem(itemId)
}

// 아이템 업데이트
const updateItem = async (item: any) => {
  await wishlistStore.updateItem(item)
}

// 가격 포맷팅
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price)
}

onMounted(() => {
  wishlistStore.loadWishlist()
})
</script>