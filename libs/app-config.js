import { isStringArray, isObject, isArray, inArray, cloneData } from './helpers/util'
import {
  createNumberRangeValidator,
  hexColorValidator,
  notNullValidator,
  getType
} from './helpers/validator'
import Exception from './helpers/exception'

const pageCtx = __$.getPageCtx()
const appJson = __$.getAppJson()

export function parseConfigByRule(configs, rules) {
  if (!isObject(configs)) {
    configs = {}
  }

  const ret = {}
  const CONFIG_ERROR = Exception.TYPE.CONFIG_ERROR

  for (const k in rules) {
    const rule = rules[k]
    const config = configs[k]

    if (rule.required && !notNullValidator(config)) {
      throw new Exception(
        `config.${k} should be ${getType(
          rule.validator || rule.type()
        )} instead of ${getType(config)}`,
        CONFIG_ERROR,
        k
      )
    } else if (config != null) {
      if (rule.validator) {
        if (!rule.validator(config)) {
          throw new Exception(
            `config.${k} should be ${getType(rule.validator)}`,
            CONFIG_ERROR,
            k
          )
        } else {
          ret[k] = config
        }
      } else if (rule.enums) {
        if (!inArray(config, rule.enums)) {
          throw new Exception(
            `config.${k} should be in [${rule.enums
              .map(v => {
                return `"${v}"`
              })
              .join(', ')}]`,
            CONFIG_ERROR,
            k
          )
        } else {
          ret[k] = config
        }
      } else if (rule.type(config) !== config) {
        throw new Exception(
          `config.${k} should be ${getType(rule.type())} instead of ${getType(
            config
          )}`,
          CONFIG_ERROR,
          k
        )
      } else {
        // 类型匹配正确
        ret[k] = config
      }
    } else if (rule.default) {
      ret[k] = rule.default
    }
  }

  return ret
}

export const configRules = {
  size: {
    windowWidth: {
      validator: createNumberRangeValidator(0, 1920),
      default: 800
    },
    windowHeight: {
      validator: createNumberRangeValidator(0, 1080),
      default: 600
    }
  },
  window: {
    navigationBarTextStyle: {
      enums: ['white', 'black'],
      default: 'black'
    },
    navigationBarBackgroundColor: {
      validator: hexColorValidator,
      default: '#EDEDED'
    },
    navigationBarTitleText: {
      type: String,
      default: ''
    }
  }
}

export const appConfig = {
  pages: [],
  window: {},
  size: {},
  tabBar: {
    list: []
  }
}

try {
  if (isStringArray(appJson.pages)) {
    appConfig.pages = appJson.pages
  }
  if (isObject(appJson.tabBar)) {
    if (isArray(appJson.tabBar.list)) {
      appConfig.tabBar.list = appJson.tabBar.list
    }
  }

  appConfig.window = parseConfigByRule(appJson.window || {}, configRules.window)
  appConfig.size = parseConfigByRule(appJson.size || {}, configRules.size)
} catch (error) {
  throw new Exception(error)
}

const configs = {}

export function getPageConfig(pagePath) {
  if (configs[pagePath]) {
    return cloneData(configs[pagePath])
  }

  const fileName = '.' + pagePath.replace('pages', '') + '.json'
  const ctx = pageCtx(fileName)

  configs[pagePath] = Object.assign(
    {},
    cloneData(appConfig.window),
    cloneData(parseConfigByRule(ctx || {}, configRules.window))
  )

  return cloneData(configs[pagePath])
}
