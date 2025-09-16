const API_KEY = "CG-FNBn6BfN7BvDsR8aUzZQ36rb"
const BASE_URL = "https://api.coingecko.com/api/v3"

export interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  sparkline_in_7d: {
    price: number[]
  }
}

export interface TrendingCoin {
  id: string
  coin_id: number
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
  small: string
  large: string
  slug: string
  price_btc: number
  score: number
}

export interface TrendingResponse {
  coins: { item: TrendingCoin }[]
}

export interface GlobalMarketData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { [key: string]: number }
  market_cap_change_percentage_24h_usd: number
  active_cryptocurrencies: number
  markets: number
  ended_icos: number
  ongoing_icos: number
  upcoming_icos: number
}

class CoinGeckoAPI {
  private async fetchWithAuth(endpoint: string, retries = 2): Promise<any> {

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          headers: {
            "x-cg-demo-api-key": API_KEY,
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          // If it's a rate limit error (429) or server error (5xx), retry
          if ((response.status === 429 || response.status >= 500) && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }

          throw new Error(`API Error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        return data
      } catch (error:any) {
        // If it's a network error and we have retries left, try again
        if (attempt < retries && (error instanceof TypeError || error.message.includes("Failed to fetch"))) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw error
      }
    }
  }

  async getCoins(page = 1, perPage = 50): Promise<CryptoCurrency[]> {
    return this.fetchWithAuth(
      `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`,
    )
  }

  async getTrending(): Promise<TrendingResponse> {
    return this.fetchWithAuth("/search/trending")
  }

  async getCoinById(id: string): Promise<any> {
    return this.fetchWithAuth(
      `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
    )
  }

  async searchCoins(query: string): Promise<any> {
    return this.fetchWithAuth(`/search?query=${encodeURIComponent(query)}`)
  }

  async getGlobalMarketData(): Promise<GlobalMarketData> {
    const response = await this.fetchWithAuth("/global")
    return response.data
  }
}

export const coinGeckoAPI = new CoinGeckoAPI()
