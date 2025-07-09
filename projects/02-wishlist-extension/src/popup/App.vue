<template>
  <div class="extension-popup bg-gray-50">
    <!-- 헤더 -->
    <header class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <HeartIcon class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-lg font-bold text-gray-900">Smart Wishlist</h1>
        </div>
        <router-link to="/settings" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <CogIcon class="w-5 h-5 text-gray-600" />
        </router-link>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>

    <!-- 하단 탭 네비게이션 -->
    <nav class="bg-white border-t border-gray-200 px-2 py-2">
      <div class="flex justify-around">
        <router-link 
          to="/" 
          class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          :class="$route.path === '/' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900'"
        >
          <HeartIcon class="w-5 h-5" />
          <span class="text-xs font-medium">홈</span>
        </router-link>
        
        <router-link 
          to="/brands" 
          class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          :class="$route.path === '/brands' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900'"
        >
          <TagIcon class="w-5 h-5" />
          <span class="text-xs font-medium">브랜드</span>
        </router-link>
        
        <router-link 
          to="/categories" 
          class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          :class="$route.path === '/categories' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900'"
        >
          <FolderIcon class="w-5 h-5" />
          <span class="text-xs font-medium">카테고리</span>
        </router-link>
        
        <router-link 
          to="/alerts" 
          class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          :class="$route.path === '/alerts' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900'"
        >
          <BellIcon class="w-5 h-5" />
          <span class="text-xs font-medium">알림</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { 
  HeartIcon, 
  CogIcon, 
  TagIcon, 
  FolderIcon, 
  BellIcon 
} from '@heroicons/vue/24/outline'
import { useWishlistStore } from '@/shared/stores/wishlist'

const wishlistStore = useWishlistStore()

onMounted(() => {
  // 앱 로드 시 위시리스트 데이터 불러오기
  wishlistStore.loadWishlist()
})
</script>

<style scoped>
.extension-popup {
  width: 380px;
  height: 500px;
  display: flex;
  flex-direction: column;
}
</style>