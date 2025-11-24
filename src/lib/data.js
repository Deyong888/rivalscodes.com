import fs from 'fs'
import path from 'path'
import * as jsonc from 'jsonc-parser';

// 读取 categories 数据
export function getCategories(locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    if (typeof categories === 'string') {
        // 如果解析后仍是字符串，可能需要二次解析
        try {
            return jsonc.parse(categories);
        } catch (error) {
            console.error('二次解析失败:', error);
            return categories; // 如果二次解析失败，返回原始解析结果
        }
    }
    return categories;
}


// 读取category数据
export function getCategoryByLink(link, locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    console.log('categories: ', categories)
    return categories.find(category => category.link === link);

}

// 读取 datalist 数据
export function getDataList(src, locale) {
    const dataPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', src);
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    if (typeof dataList === 'string') {
        // 如果解析后仍是字符串，可能需要二次解析
        try {
            return jsonc.parse(dataList);
        } catch (error) {
            console.error('二次解析失败:', error);
            return dataList; // 如果二次解析失败，返回原始解析结果
        }
    }

    return dataList;
}

// 根据关键词搜索数据
export function searchDataByKeyword(keyword, locale) {
    let result = []
    
    const categories = getCategories(locale);

    
    if (!categories || categories.length === 0) return null;

    
    for (const category of categories) {
        if (category.name.toLowerCase() == keyword.toLowerCase()) {
             const dataList = getDataList(category.src, locale)
             result = result.concat(dataList);
        } else {
            const dataList = getDataList(category.src, locale)
        
            for (const item of dataList) {
                if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
                    // search by name
                    result.push(item)
                } else if (item.tags && item.tags.some(tag => tag.toLowerCase() == keyword.toLowerCase())) {
                    // search by tags
                    // console.log('item hit: ', item)
                    result.push(item)
                }
            }
        }
        
        // console.log('result: ', result)
    }

    return result;
}

// 读取更新日志
export function getChangelog() {
    const dataPath = path.join(process.cwd(), 'data', 'json', 'changelog.jsonc');
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    return dataList;
}

// 读取武器数据
export function getWeapons(locale) {
    const weaponsPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'weapons.jsonc');
    try {
        const weapons = jsonc.parse(fs.readFileSync(weaponsPath, 'utf8'));
        if (typeof weapons === 'string') {
            try {
                return jsonc.parse(weapons);
            } catch (error) {
                console.error('二次解析失败:', error);
                return weapons;
            }
        }
        return weapons;
    } catch (error) {
        console.error('读取武器数据失败:', error);
        return [];
    }
}

// 根据ID获取单个武器
export function getWeaponById(id, locale) {
    const weapons = getWeapons(locale);
    return weapons.find(weapon => weapon.id === id);
}

// 读取资产数据
export function getAssets(locale) {
    const assetsPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'assets.jsonc');
    try {
        const assets = jsonc.parse(fs.readFileSync(assetsPath, 'utf8'));
        if (typeof assets === 'string') {
            try {
                return jsonc.parse(assets);
            } catch (error) {
                console.error('二次解析失败:', error);
                return assets;
            }
        }
        return assets;
    } catch (error) {
        console.error('读取资产数据失败:', error);
        return [];
    }
}

// 根据ID获取单个资产
export function getAssetById(id, locale) {
    const assets = getAssets(locale);
    return assets.find(asset => asset.id === id);
}