// Chrome Extension Background Script
console.log('Smart Wishlist Background Script loaded')

// 익스텐션 설치 시 초기 설정
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Wishlist Extension installed')
  
  // 기본 설정값 저장
  chrome.storage.local.set({
    settings: {
      priceTracking: true,
      notifications: true,
      theme: 'light'
    }
  })
})

// 컨텍스트 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: 'add-to-wishlist',
      title: '위시리스트에 추가',
      contexts: ['page', 'selection', 'link']
    })
  } catch (error) {
    console.error('Context menu creation failed:', error)
  }
})

// 컨텍스트 메뉴 클릭 이벤트
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-wishlist' && tab?.id) {
    // 콘텐츠 스크립트에 메시지 전송
    chrome.tabs.sendMessage(tab.id, {
      action: 'ADD_TO_WISHLIST',
      url: info.pageUrl || tab.url
    })
  }
})

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request)
  
  switch (request.action) {
    case 'GET_CURRENT_TAB':
      getCurrentTab().then(sendResponse)
      return true
    
    case 'SAVE_WISHLIST_ITEM':
      saveWishlistItem(request.data).then(sendResponse)
      return true
    
    case 'GET_WISHLIST':
      getWishlist().then(sendResponse)
      return true
      
    default:
      sendResponse({ error: 'Unknown action' })
  }
})

// 현재 탭 정보 가져오기
async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return { success: true, data: tab }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 위시리스트 아이템 저장
async function saveWishlistItem(item: any) {
  try {
    const result = await chrome.storage.local.get(['wishlist'])
    const wishlist = result.wishlist || []
    
    // 중복 체크 (URL 기반)
    const existingIndex = wishlist.findIndex((w: any) => w.url === item.url)
    
    if (existingIndex >= 0) {
      // 기존 아이템 업데이트
      wishlist[existingIndex] = { ...wishlist[existingIndex], ...item, updatedAt: new Date().toISOString() }
    } else {
      // 새 아이템 추가
      wishlist.push({ ...item, id: generateId(), addedAt: new Date().toISOString() })
    }
    
    await chrome.storage.local.set({ wishlist })
    return { success: true, data: wishlist }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 위시리스트 가져오기
async function getWishlist() {
  try {
    const result = await chrome.storage.local.get(['wishlist'])
    return { success: true, data: result.wishlist || [] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ID 생성 함수
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// 주기적 가격 체크 (나중에 구현)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'price-check') {
    console.log('Price check alarm triggered')
    // 가격 체크 로직 구현 예정
  }
})

// 알람 설정
chrome.alarms.create('price-check', { delayInMinutes: 60, periodInMinutes: 60 })