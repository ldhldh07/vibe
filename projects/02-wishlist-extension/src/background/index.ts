// Chrome Extension Background Script

// 익스텐션 설치 시 초기 설정
chrome.runtime.onInstalled.addListener(() => {
  
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
    // Context menu creation failed
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
  try {
    console.log('Background received message:', request)
  } catch (e) {
    // console.log 실패 시 무시
  }
  
  // 비동기 응답을 위해 항상 true 반환
  (async () => {
    try {
      switch (request.action) {
        case 'GET_CURRENT_TAB':
          const tabResult = await getCurrentTab()
          sendResponse(tabResult)
          break
        
        case 'SAVE_WISHLIST_ITEM':
          const saveResult = await saveWishlistItem(request.data)
          sendResponse(saveResult)
          break
        
        case 'GET_WISHLIST':
          const wishlistResult = await getWishlist()
          sendResponse(wishlistResult)
          break
          
        case 'REMOVE_WISHLIST_ITEM':
          const removeResult = await removeWishlistItem(request.data.itemId)
          sendResponse(removeResult)
          break
          
        case 'UPDATE_WISHLIST_ITEM':
          const updateResult = await updateWishlistItem(request.data)
          sendResponse(updateResult)
          break
          
        case 'CLEAR_WISHLIST':
          const clearResult = await clearWishlist()
          sendResponse(clearResult)
          break
          
        default:
          sendResponse({ error: 'Unknown action' })
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message })
    }
  })()
  
  return true // 비동기 응답을 위해 true 반환
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

// 위시리스트 아이템 제거
async function removeWishlistItem(itemId: string) {
  try {
    const result = await chrome.storage.local.get(['wishlist'])
    const wishlist = result.wishlist || []
    
    const filteredWishlist = wishlist.filter((item: any) => item.id !== itemId)
    
    await chrome.storage.local.set({ wishlist: filteredWishlist })
    return { success: true, data: filteredWishlist }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 위시리스트 아이템 업데이트
async function updateWishlistItem(updatedItem: any) {
  try {
    const result = await chrome.storage.local.get(['wishlist'])
    const wishlist = result.wishlist || []
    
    const index = wishlist.findIndex((item: any) => item.id === updatedItem.id)
    if (index >= 0) {
      wishlist[index] = { ...wishlist[index], ...updatedItem, updatedAt: new Date().toISOString() }
    }
    
    await chrome.storage.local.set({ wishlist })
    return { success: true, data: wishlist }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 위시리스트 초기화
async function clearWishlist() {
  try {
    await chrome.storage.local.set({ wishlist: [] })
    return { success: true, data: [] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ID 생성 함수
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// 주기적 가격 체크는 나중에 구현
// Background script initialization complete