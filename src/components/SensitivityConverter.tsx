'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Target, RotateCcw, Calculator, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

// 计算cm/360的函数
// 公式：cm/360 = (360 / (sensitivity * dpi * yaw)) * 2.54
// yaw是每个游戏的视角旋转系数
function calculateCmPer360(sensitivity: number, dpi: number, game: string): number {
  const gameLower = game.toLowerCase()
  
  // 各游戏的yaw值（每单位鼠标移动的视角旋转角度）
  let yaw = 0.022 // 默认值
  
  if (gameLower === 'valorant') {
    // Valorant: sensitivity * 0.314 = 实际灵敏度
    yaw = 0.314
  } else if (gameLower === 'csgo' || gameLower === 'cs2') {
    // CS:GO/CS2: sensitivity * 0.022 = 实际灵敏度
    yaw = 0.022
  } else if (gameLower === 'apex') {
    // Apex Legends: sensitivity * 0.022 = 实际灵敏度
    yaw = 0.022
  } else if (gameLower === 'roblox' || gameLower === 'rivals') {
    // Roblox: 灵敏度范围0-10，实际转换系数约为0.1
    // 实际公式更复杂，这里使用近似值
    yaw = 0.1
  }
  
  if (sensitivity <= 0 || dpi <= 0 || yaw <= 0) return 0
  
  // cm/360 = (360度 / (灵敏度 * DPI * yaw)) * 2.54 (英寸转厘米)
  const cm360 = (360 / (sensitivity * dpi * yaw)) * 2.54
  return cm360
}

// 从cm/360反推灵敏度
function calculateSensitivityFromCm360(cm360: number, dpi: number, game: string): number {
  const gameLower = game.toLowerCase()
  
  let yaw = 0.022
  
  if (gameLower === 'valorant') {
    yaw = 0.314
  } else if (gameLower === 'csgo' || gameLower === 'cs2') {
    yaw = 0.022
  } else if (gameLower === 'apex') {
    yaw = 0.022
  } else if (gameLower === 'roblox' || gameLower === 'rivals') {
    yaw = 0.1
  }
  
  if (cm360 <= 0 || dpi <= 0 || yaw <= 0) return 0
  
  // 灵敏度 = 360 / (cm/360 / 2.54) / (DPI * yaw)
  const sensitivity = (360 / (cm360 / 2.54)) / (dpi * yaw)
  return sensitivity
}

// 计算eDPI
function calculateEDPI(sensitivity: number, dpi: number, rivalsMultiplier: number = 1.0): number {
  return sensitivity * dpi * rivalsMultiplier
}

export function SensitivityConverter() {
  const t = useTranslations('sensitivityConverter')
  
  // 源游戏设置
  const [sourceGame, setSourceGame] = useState('valorant')
  const [sourceSensitivity, setSourceSensitivity] = useState('0.5')
  const [dpi, setDpi] = useState('800')
  
  // Rivals设置
  const [robloxSensitivity, setRobloxSensitivity] = useState('0.2')
  const [rivalsMultiplier, setRivalsMultiplier] = useState('1.0')
  
  // 计算结果
  const [cm360, setCm360] = useState(0)
  const [recommendedRobloxSens, setRecommendedRobloxSens] = useState(0)
  const [recommendedRivalsMultiplier, setRecommendedRivalsMultiplier] = useState(1.0)
  const [edpi, setEdpi] = useState(0)
  
  // 转换方向
  const [conversionDirection, setConversionDirection] = useState<'toRivals' | 'fromRivals'>('toRivals')

  // 计算转换结果
  useEffect(() => {
    const sourceSens = parseFloat(sourceSensitivity) || 0
    const mouseDpi = parseFloat(dpi) || 800
    const robloxSens = parseFloat(robloxSensitivity) || 0.2
    const rivalsMult = parseFloat(rivalsMultiplier) || 1.0

    if (conversionDirection === 'toRivals') {
      // 从其他游戏转换到Rivals
      const sourceCm360 = calculateCmPer360(sourceSens, mouseDpi, sourceGame)
      setCm360(sourceCm360)
      
      // 推荐Roblox灵敏度（保持相同的cm/360）
      const recommendedSens = calculateSensitivityFromCm360(sourceCm360, mouseDpi, 'roblox')
      setRecommendedRobloxSens(recommendedSens)
      
      // 计算当前设置的eDPI
      const currentEdpi = calculateEDPI(robloxSens, mouseDpi, rivalsMult)
      setEdpi(currentEdpi)
      
      // 推荐Rivals倍率（如果Roblox灵敏度固定）
      if (robloxSens > 0) {
        const targetSens = calculateSensitivityFromCm360(sourceCm360, mouseDpi, 'roblox')
        const recommendedMult = targetSens / robloxSens
        setRecommendedRivalsMultiplier(Math.max(0.1, Math.min(10, recommendedMult)))
      }
    } else {
      // 从Rivals转换到其他游戏
      const rivalsCm360 = calculateCmPer360(robloxSens * rivalsMult, mouseDpi, 'rivals')
      setCm360(rivalsCm360)
      
      // 计算目标游戏的推荐灵敏度
      const targetSens = calculateSensitivityFromCm360(rivalsCm360, mouseDpi, sourceGame)
      setRecommendedRobloxSens(targetSens)
      
      const currentEdpi = calculateEDPI(robloxSens, mouseDpi, rivalsMult)
      setEdpi(currentEdpi)
    }
  }, [sourceGame, sourceSensitivity, dpi, robloxSensitivity, rivalsMultiplier, conversionDirection])

  const handleSwapDirection = () => {
    setConversionDirection(prev => prev === 'toRivals' ? 'fromRivals' : 'toRivals')
  }

  const applyRecommended = () => {
    if (conversionDirection === 'toRivals') {
      setRobloxSensitivity(recommendedRobloxSens.toFixed(3))
      setRivalsMultiplier(recommendedRivalsMultiplier.toFixed(2))
    }
  }

  return (
    <div className="space-y-6">
      {/* 转换方向选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('conversionDirection')}
          </CardTitle>
          <CardDescription>{t('conversionDirectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={conversionDirection === 'toRivals' ? 'default' : 'outline'}
              onClick={() => setConversionDirection('toRivals')}
            >
              {t('toRivals')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapDirection}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant={conversionDirection === 'fromRivals' ? 'default' : 'outline'}
              onClick={() => setConversionDirection('fromRivals')}
            >
              {t('fromRivals')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 源游戏设置 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {conversionDirection === 'toRivals' ? t('sourceGameSettings') : t('targetGameSettings')}
            </CardTitle>
            <CardDescription>
              {conversionDirection === 'toRivals' ? t('sourceGameSettingsDesc') : t('targetGameSettingsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('game')}</label>
              <select
                value={sourceGame}
                onChange={(e) => setSourceGame(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="valorant">Valorant</option>
                <option value="csgo">CS:GO</option>
                <option value="cs2">CS2</option>
                <option value="apex">Apex Legends</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('sensitivity')}</label>
              <Input
                type="number"
                step="0.01"
                value={sourceSensitivity}
                onChange={(e) => setSourceSensitivity(e.target.value)}
                placeholder="0.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('dpi')}</label>
              <Input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rivals设置 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('rivalsSettings')}</CardTitle>
            <CardDescription>{t('rivalsSettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('robloxSensitivity')}</label>
              <Input
                type="number"
                step="0.01"
                value={robloxSensitivity}
                onChange={(e) => setRobloxSensitivity(e.target.value)}
                placeholder="0.2"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('robloxSensitivityHint')}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('rivalsMultiplier')}</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={rivalsMultiplier}
                onChange={(e) => setRivalsMultiplier(e.target.value)}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('rivalsMultiplierHint')}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('dpi')}</label>
              <Input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(e.target.value)}
                placeholder="800"
                disabled={conversionDirection === 'toRivals'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {conversionDirection === 'toRivals' ? t('dpiShared') : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 计算结果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('calculationResults')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">{t('cmPer360')}</div>
              <div className="text-2xl font-bold">{cm360.toFixed(2)} cm</div>
              <p className="text-xs text-muted-foreground mt-1">{t('cmPer360Desc')}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">{t('eDPI')}</div>
              <div className="text-2xl font-bold">{edpi.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('eDPIDesc')}</p>
            </div>
          </div>

          {conversionDirection === 'toRivals' && (
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{t('recommendedRobloxSensitivity')}</div>
                  <div className="text-lg font-bold">{recommendedRobloxSens.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{t('recommendedRivalsMultiplier')}</div>
                  <div className="text-lg font-bold">{recommendedRivalsMultiplier.toFixed(2)}x</div>
                </div>
              </div>
              <Button onClick={applyRecommended} className="w-full">
                {t('applyRecommended')}
              </Button>
            </div>
          )}

          {conversionDirection === 'fromRivals' && (
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium mb-2">{t('recommendedTargetSensitivity')}</div>
              <div className="text-2xl font-bold">{recommendedRobloxSens.toFixed(3)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('recommendedTargetSensitivityDesc', { game: sourceGame.toUpperCase() })}
              </p>
            </div>
          )}

          {/* 乘数效应说明 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('multiplierEffectTitle')}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('multiplierEffectDesc')}
                </p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-mono">
                  {t('multiplierExample')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

