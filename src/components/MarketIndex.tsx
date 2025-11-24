'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Calculator, TrendingUp, DollarSign, Package, Share2, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Asset {
  id: string
  name: string
  type: 'Wrap' | 'Charm' | 'Finisher' | 'Other'
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  currentValue: {
    keys: {
      min: number
      max: number
      average: number
    }
    robux: number
    usd?: number
  }
  priceHistory: {
    date: string
    value: number
    source: string
  }[]
  tradeFrequency: number
  lastUpdated: string
  sources: string[]
}

interface MarketIndexProps {
  assets: Asset[]
}

// 稀有度颜色映射
const rarityColors: Record<string, string> = {
  'Common': 'bg-gray-500',
  'Uncommon': 'bg-green-500',
  'Rare': 'bg-blue-500',
  'Epic': 'bg-purple-500',
  'Legendary': 'bg-orange-500',
}

// 资产卡片组件
function AssetCard({ asset, isSelected, onToggle }: { asset: Asset; isSelected: boolean; onToggle: () => void }) {
  const t = useTranslations('marketIndex')
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onToggle}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{asset.name}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="mr-2">
                {asset.type === 'Wrap' ? t('wrap') : asset.type === 'Charm' ? t('charm') : asset.type === 'Finisher' ? t('finisher') : t('other')}
              </Badge>
              <Badge className={rarityColors[asset.rarity] || 'bg-gray-500'}>
                {asset.rarity}
              </Badge>
            </CardDescription>
          </div>
          {isSelected && (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">{t('valueRange')}</div>
            <div className="text-lg font-semibold">
              {asset.currentValue.keys.min} - {asset.currentValue.keys.max} {t('keys')}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('average')}: {asset.currentValue.keys.average.toFixed(1)} {t('keys')}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground">{t('robux')}</div>
              <div className="font-semibold">{asset.currentValue.robux.toLocaleString()}</div>
            </div>
            {asset.currentValue.usd && (
              <div>
                <div className="text-muted-foreground">{t('usd')}</div>
                <div className="font-semibold">${asset.currentValue.usd}</div>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('tradeFrequency')}: {asset.tradeFrequency}/月
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 价值查询组件
function ValueSearch({ assets }: { assets: Asset[] }) {
  const t = useTranslations('marketIndex')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  
  const filteredAssets = useMemo(() => {
    if (!searchQuery) return []
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [assets, searchQuery])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          {t('valueSearch')}
        </CardTitle>
        <CardDescription>{t('valueSearchDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {searchQuery && filteredAssets.length > 0 && (
          <div className="space-y-2">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.currentValue.keys.average.toFixed(1)} {t('keys')} • {asset.currentValue.robux.toLocaleString()} {t('robux')}
                    </div>
                  </div>
                  <Badge className={rarityColors[asset.rarity] || 'bg-gray-500'}>
                    {asset.rarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedAsset && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{selectedAsset.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('valueRange')}</div>
                <div className="text-lg font-semibold">
                  {selectedAsset.currentValue.keys.min} - {selectedAsset.currentValue.keys.max} {t('keys')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('average')}</div>
                <div className="text-lg font-semibold">
                  {selectedAsset.currentValue.keys.average.toFixed(1)} {t('keys')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('robux')}</div>
                <div className="font-semibold">{selectedAsset.currentValue.robux.toLocaleString()}</div>
              </div>
              {selectedAsset.currentValue.usd && (
                <div>
                  <div className="text-sm text-muted-foreground">{t('usd')}</div>
                  <div className="font-semibold">${selectedAsset.currentValue.usd}</div>
                </div>
              )}
            </div>
            {selectedAsset.priceHistory.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">{t('priceHistory')}</div>
                <div className="space-y-1 text-sm">
                  {selectedAsset.priceHistory.slice(0, 5).map((history, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{history.date}</span>
                      <span className="font-semibold">{history.value} {t('keys')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 库存计算器组件
function InventoryCalculator({ assets }: { assets: Asset[] }) {
  const t = useTranslations('marketIndex')
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'Wrap' | 'Charm' | 'Finisher' | 'Other'>('all')
  
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || asset.type === filterType
      return matchesSearch && matchesType
    })
  }, [assets, searchQuery, filterType])
  
  const toggleAsset = (assetId: string) => {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssets(newSelected)
  }
  
  const totalValue = useMemo(() => {
    let totalKeys = 0
    let totalRobux = 0
    let totalUsd = 0
    
    selectedAssets.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId)
      if (asset) {
        totalKeys += asset.currentValue.keys.average
        totalRobux += asset.currentValue.robux
        if (asset.currentValue.usd) {
          totalUsd += asset.currentValue.usd
        }
      }
    })
    
    return { keys: totalKeys, robux: totalRobux, usd: totalUsd }
  }, [selectedAssets, assets])
  
  const clearSelection = () => {
    setSelectedAssets(new Set())
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {t('inventoryCalculator')}
        </CardTitle>
        <CardDescription>{t('inventoryCalculatorDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索和筛选 */}
        <div className="space-y-2">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              {t('all')}
            </Button>
            <Button
              variant={filterType === 'Wrap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('Wrap')}
            >
              {t('wrap')}
            </Button>
            <Button
              variant={filterType === 'Charm' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('Charm')}
            >
              {t('charm')}
            </Button>
            <Button
              variant={filterType === 'Finisher' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('Finisher')}
            >
              {t('finisher')}
            </Button>
          </div>
        </div>
        
        {/* 资产列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              onToggle={() => toggleAsset(asset.id)}
            />
          ))}
        </div>
        
        {/* 总价值显示 */}
        {selectedAssets.size > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t('totalValue')}</h3>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                {t('clear')}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t('keys')}</div>
                <div className="text-2xl font-bold">{totalValue.keys.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('robux')}</div>
                <div className="text-2xl font-bold">{totalValue.robux.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('usd')}</div>
                <div className="text-2xl font-bold">${totalValue.usd.toFixed(2)}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {t('selectedItems')}: {selectedAssets.size}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 价格趋势组件
function PriceTrends({ assets }: { assets: Asset[] }) {
  const t = useTranslations('marketIndex')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('priceTrends')}
        </CardTitle>
        <CardDescription>{t('priceTrendsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t('selectAsset')}</label>
          <select
            value={selectedAsset?.id || ''}
            onChange={(e) => {
              const asset = assets.find(a => a.id === e.target.value)
              setSelectedAsset(asset || null)
            }}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.name}</option>
            ))}
          </select>
        </div>
        
        {selectedAsset && selectedAsset.priceHistory.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">{t('currentPrice')}</div>
              <div className="text-2xl font-bold">
                {selectedAsset.currentValue.keys.average.toFixed(1)} {t('keys')}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold mb-2">{t('priceHistory')}</div>
              <div className="space-y-2">
                {selectedAsset.priceHistory.map((history, index) => {
                  const prevValue = index < selectedAsset.priceHistory.length - 1 
                    ? selectedAsset.priceHistory[index + 1].value 
                    : history.value
                  const change = history.value - prevValue
                  const changePercent = prevValue > 0 ? ((change / prevValue) * 100) : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{history.date}</div>
                        <div className="text-xs text-muted-foreground">{history.source}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{history.value} {t('keys')}</div>
                        {change !== 0 && (
                          <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 交易助手组件
function TradingAssistant() {
  const t = useTranslations('marketIndex')
  const [yourValue, setYourValue] = useState('')
  const [theirValue, setTheirValue] = useState('')
  
  const profit = useMemo(() => {
    const your = parseFloat(yourValue) || 0
    const their = parseFloat(theirValue) || 0
    return their - your
  }, [yourValue, theirValue])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t('tradingAssistant')}
        </CardTitle>
        <CardDescription>{t('tradingAssistantDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t('yourItemsValue')}</label>
          <Input
            type="number"
            placeholder="0"
            value={yourValue}
            onChange={(e) => setYourValue(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t('theirItemsValue')}</label>
          <Input
            type="number"
            placeholder="0"
            value={theirValue}
            onChange={(e) => setTheirValue(e.target.value)}
          />
        </div>
        
        {(yourValue || theirValue) && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('profitLoss')}</span>
              <span className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(1)} {t('keys')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {profit >= 0 ? t('profitMessage') : t('lossMessage')}
            </div>
          </div>
        )}
        
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
          <strong>{t('scamWarning')}</strong> {t('scamWarningDesc')}
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketIndex({ assets }: MarketIndexProps) {
  const t = useTranslations('marketIndex')
  
  return (
    <div className="space-y-6">
      {/* 价值查询 */}
      <ValueSearch assets={assets} />
      
      {/* 库存计算器 */}
      <InventoryCalculator assets={assets} />
      
      {/* 价格趋势 */}
      <PriceTrends assets={assets} />
      
      {/* 交易助手 */}
      <TradingAssistant />
    </div>
  )
}

