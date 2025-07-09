// 하이브리드 콘텐츠 스크립트 - 모든 사이트 지원
console.log('🛍️ Smart Wishlist loaded on:', window.location.href)

// 사이트 분류
interface SiteDetector {
  isEcommerce: boolean
  confidence: number // 0-1, 쇼핑 사이트일 확률
  brand: string
  extractors: ProductExtractor[]
}

interface ProductExtractor {
  name: string
  priority: number
  extract: () => ProductInfo | null
}

interface ProductInfo {
  title: string
  price: number
  originalPrice?: number
  currency: string
  image?: string
  description?: string
  category?: string
  availability?: 'in_stock' | 'out_of_stock' | 'unknown'
  brand?: string
}

// 메인 초기화
init()

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ADD_TO_WISHLIST_FROM_POPUP') {
    // 팝업에서 요청한 경우 플로팅 버튼과 동일한 로직 실행
    handleUniversalAdd()
    sendResponse({ success: true })
  } else if (request.action === 'EXTRACT_PRODUCT_INFO') {
    const siteInfo = detectSite()
    const productInfo = extractProductInfo(siteInfo.extractors)
    
    if (productInfo) {
      sendResponse({
        success: true,
        data: productInfo
      })
    } else {
      sendResponse({
        success: false,
        error: 'No product info found'
      })
    }
  }
  
  return true // 비동기 응답
})

function init() {
  const siteInfo = detectSite()
  
  console.log('🔍 Site detection result:', siteInfo)
  
  // 테스트를 위해 모든 사이트에서 버튼 표시
  console.log('🛒 Showing wishlist button for testing')
  createUniversalButton()
  
  // 고급 기능 추가 (쇼핑 사이트인 경우)
  if (siteInfo.isEcommerce || siteInfo.confidence > 0.7) {
    enhanceShoppingSite(siteInfo)
  }
  
  // 페이지 변화 감지 (SPA 대응)
  observePageChanges()
}

// 사이트 감지
function detectSite(): SiteDetector {
  const hostname = window.location.hostname
  const url = window.location.href
  
  // 1. 알려진 쇼핑몰 체크
  const knownSites = getKnownSites()
  const knownSite = knownSites.find(site => 
    site.domains.some(domain => hostname.includes(domain))
  )
  
  if (knownSite) {
    return {
      isEcommerce: true,
      confidence: 1.0,
      brand: knownSite.brand,
      extractors: knownSite.extractors
    }
  }
  
  // 2. 휴리스틱 감지
  const heuristicResult = detectByHeuristics()
  
  return {
    isEcommerce: heuristicResult.confidence > 0.7,
    confidence: heuristicResult.confidence,
    brand: heuristicResult.brand || 'Unknown',
    extractors: [createGenericExtractor()]
  }
}

// 알려진 쇼핑몰 정보
function getKnownSites() {
  return [
    {
      brand: 'Coupang',
      domains: ['coupang.com'],
      extractors: [createCoupangExtractor()]
    },
    {
      brand: '11번가',
      domains: ['11st.co.kr'],
      extractors: [create11stExtractor()]
    },
    {
      brand: 'G마켓',
      domains: ['gmarket.co.kr'],
      extractors: [createGmarketExtractor()]
    },
    {
      brand: '옥션',
      domains: ['auction.co.kr'],
      extractors: [createAuctionExtractor()]
    },
    {
      brand: 'Nike',
      domains: ['nike.com'],
      extractors: [createNikeExtractor()]
    },
    {
      brand: 'Adidas',
      domains: ['adidas.com'],
      extractors: [createAdidasExtractor()]
    },
    {
      brand: 'Amazon',
      domains: ['amazon.com', 'amazon.co.kr'],
      extractors: [createAmazonExtractor()]
    }
  ]
}

// 휴리스틱 기반 쇼핑 사이트 감지
function detectByHeuristics() {
  let confidence = 0
  let brand = null
  
  // URL 패턴 체크
  const urlPatterns = [
    /\/product\//, /\/item\//, /\/p\//, /\/dp\//, /\/goods\//,
    /\/shop\//, /\/store\//, /\/buy\//, /\/cart\//
  ]
  
  if (urlPatterns.some(pattern => pattern.test(window.location.pathname))) {
    confidence += 0.3
  }
  
  // DOM 요소 체크
  const ecommerceSelectors = [
    '.price', '.product-price', '.cost', '.amount',
    '.add-to-cart', '.buy-now', '.purchase',
    '.product-title', '.item-name',
    '.rating', '.review', '.star',
    '.shipping', '.delivery'
  ]
  
  const foundSelectors = ecommerceSelectors.filter(selector => 
    document.querySelector(selector)
  ).length
  
  confidence += (foundSelectors / ecommerceSelectors.length) * 0.5
  
  // 텍스트 패턴 체크
  const bodyText = document.body.textContent?.toLowerCase() || ''
  const ecommerceKeywords = [
    'add to cart', '장바구니', 'buy now', '구매하기', 'price', '가격',
    'shipping', '배송', 'review', '리뷰', 'rating', '평점'
  ]
  
  const foundKeywords = ecommerceKeywords.filter(keyword => 
    bodyText.includes(keyword.toLowerCase())
  ).length
  
  confidence += (foundKeywords / ecommerceKeywords.length) * 0.2
  
  // 도메인 기반 브랜드 추측
  const hostname = window.location.hostname
  brand = hostname.split('.')[0] || 'Unknown'
  
  return { confidence: Math.min(confidence, 1), brand }
}

// 범용 버튼 생성 (모든 사이트)
function createUniversalButton() {
  if (document.getElementById('smart-wishlist-btn')) return
  
  const button = document.createElement('button')
  button.id = 'smart-wishlist-btn'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    <span>위시리스트 추가</span>
  `
  
  // 스타일 적용
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '10000',
    backgroundColor: '#dc64ff',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(220, 100, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  })
  
  // 호버 효과
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = '0 6px 16px rgba(220, 100, 255, 0.4)'
  })
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = '0 4px 12px rgba(220, 100, 255, 0.3)'
  })
  
  button.addEventListener('click', handleUniversalAdd)
  
  document.body.appendChild(button)
}

// 쇼핑 사이트 고급 기능
function enhanceShoppingSite(siteInfo: SiteDetector) {
  // 자동 상품 정보 감지
  const productInfo = extractProductInfo(siteInfo.extractors)
  if (productInfo) {
    console.log('📦 Product detected:', productInfo)
    // 버튼에 상품 정보 표시
    updateButtonWithProduct(productInfo)
  }
  
  // 가격 변화 감지
  observePriceChanges()
}

// 상품 정보 추출
function extractProductInfo(extractors: ProductExtractor[]): ProductInfo | null {
  // 우선순위 순으로 추출기 실행
  const sortedExtractors = extractors.sort((a, b) => b.priority - a.priority)
  
  for (const extractor of sortedExtractors) {
    try {
      const result = extractor.extract()
      if (result && result.title && result.price) {
        return {
          ...result,
          brand: result.brand || detectBrand(),
          category: result.category || detectCategory(result.title)
        }
      }
    } catch (error) {
      console.warn(`Extractor ${extractor.name} failed:`, error)
    }
  }
  
  return null
}

// 범용 추출기
function createGenericExtractor(): ProductExtractor {
  return {
    name: 'Generic',
    priority: 1,
    extract: () => {
      // 제목 추출
      const titleSelectors = [
        'h1', '[data-testid*="title"]', '.product-title', '.item-title',
        '.product-name', '.goods-name', '[class*="title"]'
      ]
      
      let title = ''
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          title = element.textContent.trim()
          break
        }
      }
      
      // 가격 추출
      const priceSelectors = [
        '.price', '.product-price', '[data-testid*="price"]',
        '.cost', '.amount', '[class*="price"]', '.money'
      ]
      
      let price = 0
      let priceText = ''
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          priceText = element.textContent.trim()
          price = parsePrice(priceText)
          if (price > 0) break
        }
      }
      
      // 이미지 추출
      const imageSelectors = [
        '.product-image img', '.item-image img', 
        '[data-testid*="image"] img', '.main-image img'
      ]
      
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement
        if (element?.src) {
          image = element.src
          break
        }
      }
      
      if (title && price > 0) {
        return {
          title,
          price,
          currency: 'KRW',
          image,
          description: extractDescription(),
          availability: detectAvailability()
        }
      }
      
      return null
    }
  }
}

// 쿠팡 전용 추출기
function createCoupangExtractor(): ProductExtractor {
  return {
    name: 'Coupang',
    priority: 10,
    extract: () => {
      const title = document.querySelector('.prod-buy-header__title')?.textContent?.trim()
      const priceElement = document.querySelector('.total-price strong')
      const price = priceElement ? parsePrice(priceElement.textContent || '') : 0
      const image = (document.querySelector('.prod-image__detail img') as HTMLImageElement)?.src
      
      if (title && price > 0) {
        return {
          title,
          price,
          currency: 'KRW',
          image,
          brand: 'Coupang'
        }
      }
      return null
    }
  }
}

// 기타 추출기들 (간단 버전)
function create11stExtractor(): ProductExtractor {
  return {
    name: '11st',
    priority: 10,
    extract: () => {
      const title = document.querySelector('.prd_name')?.textContent?.trim()
      const price = parsePrice(document.querySelector('.price_detail strong')?.textContent || '')
      const image = (document.querySelector('.prd_img img') as HTMLImageElement)?.src
      
      return title && price > 0 ? { title, price, currency: 'KRW', image, brand: '11번가' } : null
    }
  }
}

function createGmarketExtractor(): ProductExtractor {
  return {
    name: 'Gmarket',
    priority: 10,
    extract: () => {
      const title = document.querySelector('.itemtit')?.textContent?.trim()
      const price = parsePrice(document.querySelector('.price_innerwrap strong')?.textContent || '')
      const image = (document.querySelector('.item_img img') as HTMLImageElement)?.src
      
      return title && price > 0 ? { title, price, currency: 'KRW', image, brand: 'G마켓' } : null
    }
  }
}

function createAuctionExtractor(): ProductExtractor {
  return { name: 'Auction', priority: 10, extract: () => null }
}

function createNikeExtractor(): ProductExtractor {
  return { name: 'Nike', priority: 10, extract: () => null }
}

function createAdidasExtractor(): ProductExtractor {
  return { name: 'Adidas', priority: 10, extract: () => null }
}

function createAmazonExtractor(): ProductExtractor {
  return { name: 'Amazon', priority: 10, extract: () => null }
}

// 유틸리티 함수들
function parsePrice(priceText: string): number {
  const cleanPrice = priceText.replace(/[^\d]/g, '')
  return parseInt(cleanPrice) || 0
}

function detectBrand(): string {
  const hostname = window.location.hostname
  return hostname.split('.')[0] || 'Unknown'
}

function detectCategory(title: string): string {
  // 간단한 카테고리 감지 로직
  const categories = {
    '패션': ['옷', '셔츠', '바지', '신발', '가방'],
    '전자제품': ['스마트폰', '노트북', '헤드폰', '충전기'],
    '뷰티': ['화장품', '로션', '크림', '향수'],
    '생활용품': ['수건', '침구', '조명', '정리'],
    '식품': ['과자', '음료', '차', '커피']
  }
  
  const lowTitle = title.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowTitle.includes(keyword))) {
      return category
    }
  }
  
  return '기타'
}

function extractDescription(): string {
  const descSelectors = ['.description', '.product-description', '.detail']
  for (const selector of descSelectors) {
    const element = document.querySelector(selector)
    if (element?.textContent) {
      return element.textContent.trim().substring(0, 200)
    }
  }
  return ''
}

function detectAvailability(): 'in_stock' | 'out_of_stock' | 'unknown' {
  const text = document.body.textContent?.toLowerCase() || ''
  if (text.includes('품절') || text.includes('sold out')) return 'out_of_stock'
  if (text.includes('재고') || text.includes('in stock')) return 'in_stock'
  return 'unknown'
}

// 범용 추가 핸들러
async function handleUniversalAdd() {
  const button = document.getElementById('smart-wishlist-btn')
  if (!button) return
  
  // 로딩 상태
  button.style.backgroundColor = '#fbbf24'
  button.innerHTML = `
    <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <span>추가 중...</span>
  `
  
  try {
    const siteInfo = detectSite()
    let productInfo = extractProductInfo(siteInfo.extractors)
    
    if (!productInfo) {
      // 수동 입력 모드
      productInfo = await promptForProductInfo()
    }
    
    if (productInfo) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'SAVE_WISHLIST_ITEM',
          data: {
            ...productInfo,
            url: window.location.href,
            addedAt: new Date().toISOString()
          }
        })
        
        console.log('Save response:', response)
        
        if (response?.success) {
          showSuccessState(button)
        } else {
          console.error('Save failed:', response?.error)
          showErrorState(button)
        }
      } catch (error) {
        console.error('Message send error:', error)
        showErrorState(button)
      }
    } else {
      console.log('No product info, showing error state')
      showErrorState(button)
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    showErrorState(button)
  }
}

// 수동 입력 프롬프트
async function promptForProductInfo(): Promise<ProductInfo | null> {
  const title = prompt('상품명을 입력해주세요:', document.title)
  if (!title) return null
  
  const priceText = prompt('가격을 입력해주세요 (숫자만):', '')
  const price = parsePrice(priceText || '0')
  
  if (price <= 0) {
    alert('올바른 가격을 입력해주세요.')
    return null
  }
  
  return {
    title,
    price,
    currency: 'KRW',
    brand: detectBrand(),
    category: detectCategory(title)
  }
}

// 버튼 상태 관리
function showSuccessState(button: HTMLElement) {
  button.style.backgroundColor = '#22c55e'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <span>추가됨!</span>
  `
  
  setTimeout(() => resetButton(button), 2000)
}

function showErrorState(button: HTMLElement) {
  button.style.backgroundColor = '#ef4444'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
    </svg>
    <span>실패</span>
  `
  
  setTimeout(() => resetButton(button), 2000)
}

function resetButton(button: HTMLElement) {
  button.style.backgroundColor = '#dc64ff'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    <span>위시리스트 추가</span>
  `
}

function updateButtonWithProduct(product: ProductInfo) {
  const button = document.getElementById('smart-wishlist-btn')
  if (button) {
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span>${product.title.substring(0, 20)}... 추가</span>
    `
  }
}

// 페이지 변화 감지 (SPA 대응)
function observePageChanges() {
  let currentUrl = window.location.href
  
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href
      console.log('🔄 Page changed, re-initializing...')
      
      // 기존 버튼 제거
      const existingButton = document.getElementById('smart-wishlist-btn')
      if (existingButton) {
        existingButton.remove()
      }
      
      // 재초기화
      setTimeout(init, 1000)
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// 가격 변화 감지
function observePriceChanges() {
  // 나중에 구현
}

// CSS 스타일 주입
const style = document.createElement('style')
style.textContent = `
  /* Content Script CSS */
  #smart-wishlist-btn {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    all: initial;
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important; /* 최대 z-index */
    background-color: #dc64ff !important;
    color: white !important;
    border: none !important;
    border-radius: 25px !important;
    padding: 10px 16px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 12px rgba(220, 100, 255, 0.3) !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    text-decoration: none !important;
    line-height: 1 !important;
    user-select: none !important;
  }

  #smart-wishlist-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(220, 100, 255, 0.4) !important;
  }

  #smart-wishlist-btn svg {
    flex-shrink: 0 !important;
  }

  @keyframes wishlist-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .wishlist-loading {
    animation: wishlist-spin 1s linear infinite !important;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)