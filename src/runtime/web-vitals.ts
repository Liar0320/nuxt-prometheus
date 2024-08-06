import { Gauge, register } from 'prom-client'
import { defineEventHandler, readBody } from 'h3'
// 定义指标

const webVitalsGauges: { [key: string]: { [key: string]: any } } = {
  CLS: {},
  FID: {},
  LCP: {},
  TTFB: {},
  FCP: {},
}

function createGauge(name: string, path: string) {
  const gauge = new Gauge({
    name: `web_vitals_${name.toLowerCase()}`,
    help: `${name} for ${path}`,
    labelNames: ['path'],
  })
  register.registerMetric(gauge)
  return gauge
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, value, path } = body

  if (!webVitalsGauges[name])
    webVitalsGauges[name] = {}

  if (!webVitalsGauges[name][path])
    webVitalsGauges[name][path] = createGauge(name, path)

  webVitalsGauges[name][path].set({ path }, value)
  return { status: 200 }
})
