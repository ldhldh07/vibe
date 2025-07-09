<template>
  <div class="card hover:shadow-md transition-shadow duration-200">
    <div class="flex gap-3">
      <!-- 상품 이미지 -->
      <div class="flex-shrink-0">
        <img
          v-if="item.image"
          :src="item.image"
          :alt="item.title"
          class="w-16 h-16 rounded-lg object-cover"
          @error="onImageError"
        />
        <div v-else class="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <PhotoIcon class="w-6 h-6 text-gray-400" />
        </div>
      </div>
      
      <!-- 상품 정보 -->
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-gray-900 text-sm leading-5 mb-1 line-clamp-2">
          {{ item.title }}
        </h3>
        
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg font-bold text-gray-900">
            {{ formatPrice(item.price) }}
          </span>
          <span v-if="item.originalPrice && item.originalPrice > item.price" 
                class="text-sm text-gray-500 line-through">
            {{ formatPrice(item.originalPrice) }}
          </span>
        </div>
        
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span v-if="item.brand" class="bg-gray-100 px-2 py-1 rounded">
            {{ item.brand }}
          </span>
          <span v-if="item.category" class="bg-gray-100 px-2 py-1 rounded">
            {{ item.category }}
          </span>
          <span class="ml-auto">
            {{ formatDate(item.addedAt) }}
          </span>
        </div>
      </div>
      
      <!-- 액션 버튼들 -->
      <div class="flex flex-col gap-1">
        <button
          @click="openProduct"
          class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
          title="상품 보기"
        >
          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="$emit('remove', item.id)"
          class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          title="삭제"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  PhotoIcon, 
  ArrowTopRightOnSquareIcon, 
  TrashIcon 
} from '@heroicons/vue/24/outline'
import type { WishItem } from '@/shared/stores/wishlist'

interface Props {
  item: WishItem
}

const props = defineProps<Props>()

defineEmits<{
  remove: [id: string]
  update: [item: WishItem]
}>()

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const openProduct = () => {
  chrome.tabs.create({ url: props.item.url })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return '오늘'
  if (diffInDays === 1) return '어제'
  if (diffInDays < 7) return `${diffInDays}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>