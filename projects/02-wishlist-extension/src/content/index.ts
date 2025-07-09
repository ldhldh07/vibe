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
    handleUniversalAddForPopup(sendResponse)
    return true // 비동기 응답
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
  
  // 모든 사이트에서 버튼 표시 (테스트용)
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
    },
    {
      brand: 'Uniqlo',
      domains: ['uniqlo.com'],
      extractors: [createUniqloExtractor()]
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
      
      // 가격 추출 (개선된 로직)
      const priceSelectors = [
        // 실제 가격 우선순위
        '.product-price', '.item-price', '.goods-price', '.main-price',
        '[data-testid*="price"]:not([data-testid*="point"])',
        '.price:not(.point):not(.reward):not(.coupon)',
        '.cost', '.amount', '.money',
        // 유니클로 등 브랜드 사이트 대응
        '.price-current', '.current-price', '.sale-price', '.regular-price',
        '.product-price-current', '.product-price-sale', '.product-price-regular',
        '.price-value', '.price-amount', '.price-display',
        // 숫자가 포함된 클래스 (가격일 가능성 높음)
        '[class*="price"]', '[class*="cost"]', '[class*="amount"]',
        // 메타 태그에서 가격 추출
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]'
      ]
      
      let price = 0
      let priceText = ''
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          if (element.tagName === 'META') {
            priceText = element.getAttribute('content') || ''
          } else {
            priceText = element.textContent?.trim() || ''
          }
          
          // 포인트나 쿠폰이 아닌 실제 가격인지 확인
          if (isValidPriceText(priceText)) {
            price = parsePrice(priceText)
            if (price > 0) break
          }
        }
      }
      
      // 이미지 추출 (개선된 로직)
      const imageSelectors = [
        // 상품 이미지 우선순위
        '.product-image img', '.item-image img', '.goods-image img',
        '[data-testid*="image"] img', '.main-image img', '.primary-image img',
        // 메타 태그에서 추출
        'meta[property="og:image"]', 'meta[name="twitter:image"]',
        // 일반적인 이미지 선택자들
        '.thumbnail img', '.photo img', '.picture img',
        'img[alt*="상품"]', 'img[alt*="product"]', 'img[alt*="item"]',
        // 첫 번째 큰 이미지 (최후 수단)
        'img[width]:not([width="1"]):not([width="0"])',
        'img[style*="width"]:not([style*="1px"]):not([style*="0px"])'
      ]
      
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement | HTMLMetaElement
        
        if (element) {
          let src = ''
          
          if (element.tagName === 'META') {
            src = element.getAttribute('content') || ''
          } else if (element.tagName === 'IMG') {
            const imgElement = element as HTMLImageElement
            src = imgElement.src || imgElement.getAttribute('data-src') || imgElement.getAttribute('data-original') || ''
          }
          
          // 유효한 이미지 URL인지 확인
          if (src && isValidImageUrl(src)) {
            image = src
            break
          }
        }
      }
      
      // 제목이 있으면 가격이 없어도 기본값 사용
      if (title) {
        return {
          title,
          price: price > 0 ? price : 0,
          currency: 'KRW',
          image,
          description: extractDescription(),
          availability: detectAvailability()
        }
      }
      
      // 제목도 없으면 페이지 제목 사용
      const pageTitle = document.title.trim()
      if (pageTitle) {
        return {
          title: pageTitle,
          price: 0,
          currency: 'KRW',
          image,
          description: extractDescription(),
          availability: 'unknown'
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
      // 제목 추출 (여러 선택자 시도)
      const titleSelectors = [
        '.prod-buy-header__title',
        '.prod-title',
        '.product-title',
        'h1'
      ]
      let title = ''
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          title = element.textContent.trim()
          break
        }
      }
      
      // 가격 추출 (여러 선택자 시도)
      const priceSelectors = [
        '.total-price strong',
        '.price-value',
        '.prod-price__unit',
        '.prod-price .price',
        '.prod-price strong',
        '.price-info .price',
        '.price:not(.point):not(.reward)'
      ]
      let price = 0
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          const priceText = element.textContent.trim()
          if (isValidPriceText(priceText)) {
            price = parsePrice(priceText)
            if (price > 0) break
          }
        }
      }
      
      // 이미지 추출 (여러 선택자 시도)
      const imageSelectors = [
        '.prod-image__detail img',
        '.prod-image img',
        '.product-image img',
        'meta[property="og:image"]'
      ]
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement | HTMLMetaElement
        if (element) {
          let src = ''
          if (element.tagName === 'META') {
            src = element.getAttribute('content') || ''
          } else {
            src = (element as HTMLImageElement).src || ''
          }
          if (src && isValidImageUrl(src)) {
            image = src
            break
          }
        }
      }
      
      if (title && price > 0) {
        return {
          title,
          price,
          currency: 'KRW',
          image,
          brand: 'Coupang',
          category: detectCategory(title),
          availability: detectAvailability()
        }
      }
      return null
    }
  }
}

// 11번가 전용 추출기
function create11stExtractor(): ProductExtractor {
  return {
    name: '11st',
    priority: 10,
    extract: () => {
      // 제목 추출
      const titleSelectors = ['.prd_name', '.product-title', 'h1', '.item-name']
      let title = ''
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          title = element.textContent.trim()
          break
        }
      }
      
      // 가격 추출
      const priceSelectors = ['.price_detail strong', '.price', '.product-price']
      let price = 0
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          const priceText = element.textContent.trim()
          if (isValidPriceText(priceText)) {
            price = parsePrice(priceText)
            if (price > 0) break
          }
        }
      }
      
      // 이미지 추출
      const imageSelectors = ['.prd_img img', '.product-image img', 'meta[property="og:image"]']
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement | HTMLMetaElement
        if (element) {
          let src = ''
          if (element.tagName === 'META') {
            src = element.getAttribute('content') || ''
          } else {
            src = (element as HTMLImageElement).src || ''
          }
          if (src && isValidImageUrl(src)) {
            image = src
            break
          }
        }
      }
      
      return title && price > 0 ? { 
        title, 
        price, 
        currency: 'KRW', 
        image, 
        brand: '11번가',
        category: detectCategory(title),
        availability: detectAvailability()
      } : null
    }
  }
}

// G마켓 전용 추출기
function createGmarketExtractor(): ProductExtractor {
  return {
    name: 'Gmarket',
    priority: 10,
    extract: () => {
      // 제목 추출
      const titleSelectors = ['.itemtit', '.product-title', 'h1', '.item-name']
      let title = ''
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          title = element.textContent.trim()
          break
        }
      }
      
      // 가격 추출
      const priceSelectors = ['.price_innerwrap strong', '.price', '.product-price']
      let price = 0
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          const priceText = element.textContent.trim()
          if (isValidPriceText(priceText)) {
            price = parsePrice(priceText)
            if (price > 0) break
          }
        }
      }
      
      // 이미지 추출
      const imageSelectors = ['.item_img img', '.product-image img', 'meta[property="og:image"]']
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement | HTMLMetaElement
        if (element) {
          let src = ''
          if (element.tagName === 'META') {
            src = element.getAttribute('content') || ''
          } else {
            src = (element as HTMLImageElement).src || ''
          }
          if (src && isValidImageUrl(src)) {
            image = src
            break
          }
        }
      }
      
      return title && price > 0 ? { 
        title, 
        price, 
        currency: 'KRW', 
        image, 
        brand: 'G마켓',
        category: detectCategory(title),
        availability: detectAvailability()
      } : null
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

// Uniqlo 전용 추출기
function createUniqloExtractor(): ProductExtractor {
  return {
    name: 'Uniqlo',
    priority: 10,
    extract: () => {
      // 제목 추출
      const titleSelectors = [
        '.pdp-product-name',
        '.product-title',
        'h1[data-testid*="product-title"]',
        'h1',
        '.pdp-product-name h1'
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
        '.price-current',
        '.current-price',
        '.sale-price',
        '.regular-price',
        '.product-price-current',
        '.product-price',
        '.price',
        '[data-testid*="price"]',
        '[class*="price"]'
      ]
      
      let price = 0
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector)
        if (element?.textContent) {
          const priceText = element.textContent.trim()
          if (isValidPriceText(priceText)) {
            price = parsePrice(priceText)
            if (price > 0) break
          }
        }
      }
      
      // 이미지 추출
      const imageSelectors = [
        '.pdp-product-image img',
        '.product-image img',
        '.main-image img',
        '.primary-image img',
        'meta[property="og:image"]'
      ]
      
      let image = ''
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement | HTMLMetaElement
        if (element) {
          let src = ''
          if (element.tagName === 'META') {
            src = element.getAttribute('content') || ''
          } else {
            src = (element as HTMLImageElement).src || ''
          }
          if (src && isValidImageUrl(src)) {
            image = src
            break
          }
        }
      }
      
      if (title && price > 0) {
        return {
          title,
          price,
          currency: 'KRW',
          image,
          brand: 'Uniqlo',
          category: detectCategory(title),
          availability: detectAvailability()
        }
      }
      return null
    }
  }
}

// 유틸리티 함수들
function isValidPriceText(text: string): boolean {
  if (!text || text.length < 2) return false
  
  // 포인트나 쿠폰 관련 키워드 제외
  const excludeKeywords = [
    'point', 'points', '포인트', 'P',
    'coupon', '쿠폰', 'discount', '할인',
    'reward', '리워드', 'bonus', '보너스',
    'save', '절약', 'cashback', '캐시백',
    'mile', '마일', 'membership', '멤버십'
  ]
  
  const lowerText = text.toLowerCase()
  if (excludeKeywords.some(keyword => lowerText.includes(keyword))) {
    return false
  }
  
  // 실제 가격을 나타내는 패턴 확인
  const pricePatterns = [
    /\d+(?:,\d{3})*원/,  // 49,900원
    /\d+(?:,\d{3})*\s*원/,  // 49,900 원
    /\d+만원/,  // 4만원
    /\d+(?:,\d{3})*$/,  // 49,900 (숫자만)
    /\$\d+(?:,\d{3})*(?:\.\d{2})?/,  // $49,900.00
    /\d+(?:,\d{3})*(?:\.\d{2})?/  // 49,900.00
  ]
  
  return pricePatterns.some(pattern => pattern.test(text))
}

function parsePrice(priceText: string): number {
  if (!priceText) return 0
  
  // 한국어 가격 패턴 추출 (원, 만원, 억원 등)
  const koreanPriceMatch = priceText.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:만\s*)?원/)
  if (koreanPriceMatch) {
    const numberPart = koreanPriceMatch[1].replace(/,/g, '')
    const isManWon = priceText.includes('만원')
    const price = parseFloat(numberPart)
    return isManWon ? price * 10000 : price
  }
  
  // 일반적인 가격 패턴 (숫자 + 쉼표)
  const generalPriceMatch = priceText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/)
  if (generalPriceMatch) {
    const numberPart = generalPriceMatch[1].replace(/,/g, '')
    return parseFloat(numberPart)
  }
  
  // 연속된 숫자만 있는 경우 (최대 10자리까지만 허용)
  const numbersOnly = priceText.replace(/[^\d]/g, '')
  if (numbersOnly.length > 0 && numbersOnly.length <= 10) {
    const price = parseInt(numbersOnly)
    // 상식적인 가격 범위 체크 (1원 ~ 100억원)
    if (price >= 1 && price <= 10000000000) {
      return price
    }
  }
  
  return 0
}

function isValidImageUrl(url: string): boolean {
  // 기본 URL 검사
  if (!url || url.length < 10) return false
  
  // 데이터 URL은 제외
  if (url.startsWith('data:')) return false
  
  // 아이콘이나 작은 이미지 제외
  if (url.includes('icon') || url.includes('logo') || url.includes('sprite')) return false
  
  // 광고나 트래킹 이미지 제외
  if (url.includes('ad') || url.includes('banner') || url.includes('tracking')) return false
  
  // 1px 이미지 제외
  if (url.includes('1x1') || url.includes('1pixel')) return false
  
  // 상대 경로를 절대 경로로 변환
  if (url.startsWith('//')) {
    url = window.location.protocol + url
  } else if (url.startsWith('/')) {
    url = window.location.origin + url
  }
  
  // 이미지 확장자 확인
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
  
  // URL에 이미지 확장자가 있거나, 이미지 관련 키워드가 있으면 유효
  return hasImageExtension || url.includes('image') || url.includes('photo') || url.includes('picture')
}

function detectBrand(): string {
  const hostname = window.location.hostname
  
  // 알려진 쇼핑몰 브랜드 매핑
  const brandMap: { [key: string]: string } = {
    'coupang.com': 'Coupang',
    '11st.co.kr': '11번가',
    'gmarket.co.kr': 'G마켓',
    'auction.co.kr': '옥션',
    'nike.com': 'Nike',
    'adidas.com': 'Adidas',
    'amazon.com': 'Amazon',
    'amazon.co.kr': 'Amazon Korea',
    'naver.com': 'Naver',
    'google.com': 'Google',
    'youtube.com': 'YouTube',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'twitter.com': 'Twitter',
    'github.com': 'GitHub'
  }
  
  // 정확한 도메인 매칭 먼저 시도
  for (const [domain, brand] of Object.entries(brandMap)) {
    if (hostname.includes(domain)) {
      return brand
    }
  }
  
  // 도메인에서 브랜드명 추출
  const parts = hostname.split('.')
  let brandPart = ''
  
  // www, m, mobile 등 제거
  for (const part of parts) {
    if (part !== 'www' && part !== 'm' && part !== 'mobile' && part !== 'shop' && part.length > 2) {
      brandPart = part
      break
    }
  }
  
  // 첫 글자 대문자로 변환
  return brandPart ? brandPart.charAt(0).toUpperCase() + brandPart.slice(1) : 'Unknown'
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

// URL에서 브랜드 추출
function getBrandFromUrl(): string {
  const hostname = window.location.hostname
  const brandMap: { [key: string]: string } = {
    'coupang.com': 'Coupang',
    '11st.co.kr': '11번가',
    'gmarket.co.kr': 'G마켓',
    'auction.co.kr': '옥션',
    'nike.com': 'Nike',
    'adidas.com': 'Adidas',
    'amazon.com': 'Amazon',
    'amazon.co.kr': 'Amazon Korea',
    'naver.com': 'Naver',
    'google.com': 'Google',
    'youtube.com': 'YouTube',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'twitter.com': 'Twitter',
    'github.com': 'GitHub'
  }
  
  for (const [domain, brand] of Object.entries(brandMap)) {
    if (hostname.includes(domain)) {
      return brand
    }
  }
  
  // 기본 브랜드 추출 (도메인에서)
  const parts = hostname.split('.')
  let brandName = ''
  
  for (const part of parts) {
    if (part !== 'www' && part !== 'm' && part !== 'mobile' && part !== 'shop' && part.length > 2) {
      brandName = part
      break
    }
  }
  
  return brandName ? brandName.charAt(0).toUpperCase() + brandName.slice(1) : 'Unknown'
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

// 팝업 전용 핸들러
async function handleUniversalAddForPopup(sendResponse: (response: any) => void) {
  console.log('🎯 Popup requested wishlist add')
  
  try {
    const siteInfo = detectSite()
    let productInfo = extractProductInfo(siteInfo.extractors)
    
    // 자동 추출로만 처리 (수동 입력 제거)
    if (!productInfo) {
      // 최후의 수단: 페이지 제목을 사용
      productInfo = {
        title: document.title.trim() || '제목 없음',
        price: 0,
        currency: 'KRW',
        image: '',
        brand: getBrandFromUrl(),
        category: 'unknown',
        availability: 'unknown'
      }
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
          sendResponse({ 
            success: true, 
            message: '위시리스트에 추가되었습니다!',
            item: {
              ...productInfo,
              url: window.location.href,
              addedAt: new Date().toISOString()
            }
          })
        } else {
          console.error('Save failed:', response?.error)
          sendResponse({ 
            success: false, 
            error: response?.error || '저장에 실패했습니다.'
          })
        }
      } catch (error) {
        console.error('Message send error:', error)
        sendResponse({ 
          success: false, 
          error: '저장 중 오류가 발생했습니다.'
        })
      }
    } else {
      console.log('No product info, user cancelled')
      sendResponse({ 
        success: false, 
        error: '추가가 취소되었습니다.'
      })
    }
  } catch (error) {
    console.error('Error in popup add handler:', error)
    sendResponse({ 
      success: false, 
      error: '처리 중 오류가 발생했습니다.'
    })
  }
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
    
    // 자동 추출로만 처리 (수동 입력 제거)
    if (!productInfo) {
      // 최후의 수단: 페이지 제목을 사용
      productInfo = {
        title: document.title.trim() || '제목 없음',
        price: 0,
        currency: 'KRW',
        image: '',
        brand: getBrandFromUrl(),
        category: 'unknown',
        availability: 'unknown'
      }
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