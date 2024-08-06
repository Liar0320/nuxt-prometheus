// server/api/analytics.ts

import { defineEventHandler, readBody } from 'h3'
import promClient from 'prom-client'

// 创建一个 Prometheus 指标注册表
const register = new promClient.Registry()

// 用来存储已经存在的指标
const webVitalsGauges: Record<string, promClient.Gauge<string>> = {}

function getOrCreateGauge(name: string): promClient.Gauge<string> {
  // 如果指标不存在，则创建一个新的
  if (!webVitalsGauges[name]) {
    webVitalsGauges[name] = new promClient.Gauge({
      name: `web_vitals_${name.toLowerCase()}`,
      help: `${name} value`,
      labelNames: ['path'],
    })
    register.registerMetric(webVitalsGauges[name])
  }
  return webVitalsGauges[name]
}

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    const { name, value, path } = body

    // 获取或创建指标，并更新其值
    const gauge = getOrCreateGauge(name)
    gauge.set({ path }, value)

    return { status: 'success' }
  }
  else if (event.node.req.method === 'GET') {
    event.node.res.setHeader('Content-Type', register.contentType)
    event.node.res.end(await register.metrics())
  }
})
