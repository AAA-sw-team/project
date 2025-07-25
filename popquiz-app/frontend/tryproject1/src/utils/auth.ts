// 认证工具函数
// 统一管理token的存储和获取，支持会话级别的登录状态

export class AuthManager {
  private static readonly TOKEN_KEY = 'token'
  private static readonly USE_SESSION_STORAGE = true // 设置为true使用sessionStorage，false使用localStorage

  // 获取token
  static getToken(): string | null {
    if (this.USE_SESSION_STORAGE) {
      return sessionStorage.getItem(this.TOKEN_KEY)
    } else {
      return localStorage.getItem(this.TOKEN_KEY)
    }
  }

  // 设置token
  static setToken(token: string): void {
    if (this.USE_SESSION_STORAGE) {
      sessionStorage.setItem(this.TOKEN_KEY, token)
    } else {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  // 移除token
  static removeToken(): void {
    if (this.USE_SESSION_STORAGE) {
      sessionStorage.removeItem(this.TOKEN_KEY)
    } else {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  // 清除所有认证相关数据
  static clearAuth(): void {
    // 清除token
    sessionStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('currentLectureId')
    localStorage.removeItem('currentLecture')
    
    // 清除session数据
    sessionStorage.clear()
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    try {
      // 检查token是否有效（简单的格式检查）
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload && payload.exp > Date.now() / 1000
    } catch (e) {
      // token无效，清除它
      this.removeToken()
      return false
    }
  }

  // 获取用户角色
  static getUserRole(): string | null {
    const token = this.getToken()
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.role || null
    } catch (e) {
      console.error('Token解析失败:', e)
      this.removeToken()
      return null
    }
  }

  // 获取用户信息
  static getUserInfo(): any {
    const token = this.getToken()
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.id || payload.userId || payload.sub,
        username: payload.username || payload.name,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat
      }
    } catch (e) {
      console.error('Token解析失败:', e)
      this.removeToken()
      return null
    }
  }
}

// 页面可见性变化监听
export class VisibilityManager {
  private static instance: VisibilityManager | null = null
  private isHidden = false

  static getInstance(): VisibilityManager {
    if (!this.instance) {
      this.instance = new VisibilityManager()
    }
    return this.instance
  }

  constructor() {
    this.setupVisibilityListener()
  }

  private setupVisibilityListener() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isHidden = true
        console.log('页面已隐藏')
      } else {
        if (this.isHidden) {
          // 页面从隐藏状态变为可见，可能是用户重新打开标签页
          console.log('页面重新可见')
          this.handlePageVisible()
        }
        this.isHidden = false
      }
    })

    // 监听页面卸载
    window.addEventListener('beforeunload', () => {
      this.handlePageUnload()
    })

    // 监听页面加载
    window.addEventListener('load', () => {
      this.handlePageLoad()
    })
  }

  private handlePageVisible() {
    // 页面重新可见时的处理逻辑
    // 可以在这里添加重新验证token的逻辑
  }

  private handlePageUnload() {
    // 页面卸载时的处理逻辑
    console.log('页面即将卸载')
  }

  private handlePageLoad() {
    // 页面加载时的处理逻辑
    console.log('页面已加载')
  }
}

// 自动初始化
VisibilityManager.getInstance()
