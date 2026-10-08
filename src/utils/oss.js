import OSS from 'ali-oss'
import request from '../api'

let client = null

export async function initOssClient() {
  const res = await request.get('/api/oss/sts-token')
  const data = res.data || res

  const ossRegion = data.region.startsWith('oss-')
    ? data.region
    : `oss-${data.region}`

  client = new OSS({
    region: ossRegion,               // oss-cn-hangzhou
    accessKeyId: data.accessKeyId,
    accessKeySecret: data.accessKeySecret,
    stsToken: data.securityToken,
    bucket: data.bucket,             // seckill-system-lzx
    secure: true,
  })

  return client
}

export function generateObjectKey(filename) {
  const ext = filename.slice(filename.lastIndexOf('.'))
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `uploads/${y}${m}/${timestamp}_${random}${ext}`
}

export async function uploadToOss(file) {
  if (!client) await initOssClient()

  const objectKey = generateObjectKey(file.name)

  await client.put(objectKey, file)

  // ★ 手动拼 URL，保证格式正确
  const bucket = client.options.bucket
  const region = client.options.region       // oss-cn-hangzhou
  return `https://${bucket}.${region}.aliyuncs.com/${objectKey}`
}