'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, Zap, TrendingUp, Shield, Heart, Calculator, Search, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Weapon {
  id: string
  name: string
  slot: 'Primary' | 'Secondary' | 'Melee'
  baseDamage: number
  headshotMultiplier: number
  fireRate: number
  dps: number
  ttk: {
    body: number
    headshot: number
  }
  movementSpeedModifier: number
  range: {
    min: number
    max: number
    damageFalloff: boolean
  }
  specialMechanics?: {
    type: string
    description: string
    cooldown?: number
    duration?: number
  } | null
  lastUpdated: string
  version: string
}

interface MetaLabProps {
  weapons: Weapon[]
}

// 计算TTK
function calculateTTK(weapon: Weapon, health: number, hasArmor: boolean, isHeadshot: boolean): {
  ttk: number
  shotsRequired: number
  damageBreakdown: number[]
} {
  const effectiveHealth = hasArmor ? health + 50 : health // 假设护盾提供50点额外血量
  const damagePerShot = isHeadshot 
    ? weapon.baseDamage * weapon.headshotMultiplier 
    : weapon.baseDamage
  
  const shotsRequired = Math.ceil(effectiveHealth / damagePerShot)
  const ttk = (shotsRequired - 1) * weapon.fireRate
  
  const damageBreakdown: number[] = []
  let remainingHealth = effectiveHealth
  for (let i = 0; i < shotsRequired; i++) {
    const damage = Math.min(damagePerShot, remainingHealth)
    damageBreakdown.push(damage)
    remainingHealth -= damage
  }
  
  return { ttk, shotsRequired, damageBreakdown }
}

// 武器卡片组件
function WeaponCard({ weapon, onSelect }: { weapon: Weapon; onSelect: () => void }) {
  const t = useTranslations('metaLab')
  
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{weapon.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="secondary" className="mr-2">
                {weapon.slot === 'Primary' ? t('primary') : weapon.slot === 'Secondary' ? t('secondary') : t('melee')}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">{t('baseDamage')}</div>
            <div className="text-lg font-semibold">{weapon.baseDamage}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('dps')}</div>
            <div className="text-lg font-semibold">{weapon.dps.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('ttkBody')}</div>
            <div className="text-lg font-semibold">{weapon.ttk.body.toFixed(2)}s</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('ttkHeadshot')}</div>
            <div className="text-lg font-semibold">{weapon.ttk.headshot.toFixed(2)}s</div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('movementSpeed')}</div>
            <div className={`text-lg font-semibold ${weapon.movementSpeedModifier >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weapon.movementSpeedModifier > 0 ? '+' : ''}{weapon.movementSpeedModifier}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">{t('fireRate')}</div>
            <div className="text-lg font-semibold">{weapon.fireRate.toFixed(2)}s</div>
          </div>
        </div>
        {weapon.specialMechanics && (
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
            <strong>{t('specialMechanics')}:</strong> {weapon.specialMechanics.description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// TTK计算器组件
function TTKCalculator({ weapons }: { weapons: Weapon[] }) {
  const t = useTranslations('metaLab')
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(weapons[0]?.id || '')
  const [health, setHealth] = useState('100')
  const [hasArmor, setHasArmor] = useState(false)
  const [isHeadshot, setIsHeadshot] = useState(false)
  
  const selectedWeapon = weapons.find(w => w.id === selectedWeaponId)
  const result = selectedWeapon 
    ? calculateTTK(selectedWeapon, parseInt(health) || 100, hasArmor, isHeadshot)
    : null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {t('ttkCalculator')}
        </CardTitle>
        <CardDescription>{t('ttkCalculatorDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">{t('selectWeapon')}</label>
          <select
            value={selectedWeaponId}
            onChange={(e) => setSelectedWeaponId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {weapons.map(weapon => (
              <option key={weapon.id} value={weapon.id}>{weapon.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">{t('targetHealth')}</label>
          <Input
            type="number"
            value={health}
            onChange={(e) => setHealth(e.target.value)}
            placeholder="100"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasArmor}
              onChange={(e) => setHasArmor(e.target.checked)}
              className="w-4 h-4"
            />
            <Shield className="w-4 h-4" />
            <span className="text-sm">{t('hasArmor')}</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHeadshot}
              onChange={(e) => setIsHeadshot(e.target.checked)}
              className="w-4 h-4"
            />
            <Target className="w-4 h-4" />
            <span className="text-sm">{t('headshotOnly')}</span>
          </label>
        </div>
        
        {result && selectedWeapon && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('ttk')}</span>
              <span className="text-2xl font-bold">{result.ttk.toFixed(2)}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('shotsRequired')}</span>
              <span className="text-xl font-semibold">{result.shotsRequired}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {t('damagePerShot')}: {isHeadshot 
                ? (selectedWeapon.baseDamage * selectedWeapon.headshotMultiplier).toFixed(0)
                : selectedWeapon.baseDamage.toFixed(0)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Tier List组件
function TierList({ weapons }: { weapons: Weapon[] }) {
  const t = useTranslations('metaLab')
  
  // 根据DPS和TTK计算综合评分
  const weaponsWithScore = weapons.map(weapon => ({
    ...weapon,
    score: (weapon.dps * 0.4) + ((1 / weapon.ttk.body) * 100 * 0.4) + (weapon.movementSpeedModifier * 0.2)
  }))
  
  const sortedWeapons = [...weaponsWithScore].sort((a, b) => b.score - a.score)
  
  // 分级
  const tierS = sortedWeapons.filter(w => w.score >= 80)
  const tierA = sortedWeapons.filter(w => w.score >= 60 && w.score < 80)
  const tierB = sortedWeapons.filter(w => w.score >= 40 && w.score < 60)
  const tierC = sortedWeapons.filter(w => w.score < 40)
  
  const tiers = [
    { name: 'S', weapons: tierS, color: 'bg-purple-500' },
    { name: 'A', weapons: tierA, color: 'bg-red-500' },
    { name: 'B', weapons: tierB, color: 'bg-blue-500' },
    { name: 'C', weapons: tierC, color: 'bg-gray-500' },
  ]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('tierList')}
        </CardTitle>
        <CardDescription>{t('tierListDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tiers.map(tier => (
            <div key={tier.name}>
              <div className={`${tier.color} text-white px-4 py-2 rounded-t-lg font-bold text-lg`}>
                Tier {tier.name}
              </div>
              <div className="border border-t-0 rounded-b-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {tier.weapons.map(weapon => (
                    <div key={weapon.id} className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold">{weapon.name}</div>
                      <div className="text-xs text-muted-foreground">
                        DPS: {weapon.dps.toFixed(0)} | TTK: {weapon.ttk.body.toFixed(2)}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function MetaLab({ weapons }: MetaLabProps) {
  const t = useTranslations('metaLab')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSlot, setFilterSlot] = useState<'all' | 'Primary' | 'Secondary' | 'Melee'>('all')
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)
  
  const filteredWeapons = useMemo(() => {
    return weapons.filter(weapon => {
      const matchesSearch = weapon.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSlot = filterSlot === 'all' || weapon.slot === filterSlot
      return matchesSearch && matchesSlot
    })
  }, [weapons, searchQuery, filterSlot])
  
  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('searchAndFilter')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterSlot === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSlot('all')}
            >
              {t('all')}
            </Button>
            <Button
              variant={filterSlot === 'Primary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSlot('Primary')}
            >
              {t('primary')}
            </Button>
            <Button
              variant={filterSlot === 'Secondary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSlot('Secondary')}
            >
              {t('secondary')}
            </Button>
            <Button
              variant={filterSlot === 'Melee' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSlot('Melee')}
            >
              {t('melee')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 武器列表 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('weaponDatabase')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWeapons.map(weapon => (
            <WeaponCard
              key={weapon.id}
              weapon={weapon}
              onSelect={() => setSelectedWeapon(weapon)}
            />
          ))}
        </div>
      </div>
      
      {/* TTK计算器 */}
      <TTKCalculator weapons={weapons} />
      
      {/* Tier List */}
      <TierList weapons={weapons} />
    </div>
  )
}

