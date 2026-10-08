<template>
  <div class="seckill-edit">
    <div class="page-header">
      <div>
        <h2>{{ isEdit ? '编辑活动' : '新建活动' }}</h2>
        <p>选择商品，设置秒杀价和库存</p>
      </div>
      <button class="ghost-btn" @click="$router.back()">← 返回</button>
    </div>

    <div class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">活动信息</div>

          <el-form-item label="选择商品" prop="productId">
            <el-select
              v-model="form.productId"
              placeholder="选择商品"
              style="width: 100%"
              :disabled="isEdit"
            >
              <el-option
                v-for="p in products"
                :key="p.id"
                :label="`${p.title}（原价 ¥${p.price}）`"
                :value="p.id"
              />
            </el-select>
            <div v-if="isEdit" class="field-tip">活动创建后商品不可更换</div>
          </el-form-item>

          <el-form-item label="活动名称" prop="name">
            <el-input v-model="form.name" maxlength="128" show-word-limit placeholder="如：双十一秒杀" />
          </el-form-item>

          <el-form-item label="活动时间" prop="timeRange">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">价格与库存</div>

          <div class="form-row">
            <el-form-item label="秒杀价" prop="seckillPrice" class="flex-1">
              <el-input-number v-model="form.seckillPrice" :min="0.01" :precision="2" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>

            <el-form-item label="库存" prop="totalStock" class="flex-1">
              <el-input-number v-model="form.totalStock" :min="1" :step="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="ghost-btn-lg" @click="$router.back()">取消</button>
          <button type="button" class="primary-btn-lg" :disabled="submitting" @click="submit">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listProducts, saveSeckillActivity, getSeckillActivity } from '../../api/merchant'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const formRef = ref()
const products = ref([])
const timeRange = ref([])

const form = reactive({
  id: null,
  productId: null,
  name: '',
  seckillPrice: 0,
  totalStock: 100,
  startTime: '',
  endTime: '',
})

const rules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'blur' }],
  totalStock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

watch(timeRange, (v) => {
  if (v && v.length === 2) {
    form.startTime = v[0]
    form.endTime = v[1]
  }
})

async function loadProducts() {
  try {
    const res = await listProducts({ pageNum: 1, pageSize: 200, status: 1 })
    const data = res.data || res
    products.value = data.records || []
  } catch (e) {
    ElMessage.error('加载商品失败')
  }
}

async function loadActivity() {
  if (!isEdit.value) return
  try {
    const res = await getSeckillActivity(route.params.id)
    const data = res.data || res
    Object.assign(form, {
      id: data.id,
      productId: data.productId,
      name: data.name,
      seckillPrice: data.seckillPrice,
      totalStock: data.totalStock,
      startTime: data.startTime,
      endTime: data.endTime,
    })
    timeRange.value = [data.startTime, data.endTime]
  } catch (e) {
    ElMessage.error('加载活动失败')
  }
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch (e) { return }
  if (!form.startTime || !form.endTime) {
    ElMessage.warning('请选择活动时间')
    return
  }
  submitting.value = true
  try {
    await saveSeckillActivity(form)
    ElMessage.success('保存成功')
    router.push('/merchant/seckill')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadProducts()
  loadActivity()
})
</script>

<style scoped>
.seckill-edit { max-width: 900px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 26px; font-weight: 800; letter-spacing: 1px;
  color: #000; margin-bottom: 6px;
}
.page-header p { font-size: 13px; color: #999; }

.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px;
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.form-card {
  background: #fff; border-radius: 12px;
  border: 1px solid #eee; padding: 32px 36px;
}

.form-section {
  margin-bottom: 32px; padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}
.form-section:last-of-type {
  border-bottom: none; margin-bottom: 0; padding-bottom: 0;
}

.section-title {
  font-size: 13px; font-weight: 700; color: #000;
  letter-spacing: 2px; text-transform: uppercase;
  margin-bottom: 20px; position: relative; padding-left: 12px;
}
.section-title::before {
  content: ''; position: absolute; left: 0; top: 50%;
  transform: translateY(-50%); width: 3px; height: 14px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 2px;
}

:deep(.el-form-item__label) {
  font-size: 13px; font-weight: 600; color: #333;
  letter-spacing: 0.5px; padding-bottom: 6px;
}

.form-row { display: flex; gap: 24px; }
.flex-1 { flex: 1; }

.field-tip { font-size: 12px; color: #999; margin-top: 6px; }

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e5e5 inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #000 inset !important;
}

:deep(.el-input-number) { width: 100%; }

.form-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 32px; padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.ghost-btn-lg, .primary-btn-lg {
  padding: 11px 28px; font-size: 14px; font-weight: 600;
  letter-spacing: 1px; border-radius: 6px; cursor: pointer;
  transition: all 0.25s;
}
.ghost-btn-lg {
  background: #fff; color: #333; border: 1px solid #e5e5e5;
}
.ghost-btn-lg:hover { border-color: #000; color: #000; }

.primary-btn-lg {
  background: #000; color: #fff; border: none;
}
.primary-btn-lg:hover:not(:disabled) {
  background: #1a1a1a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
.primary-btn-lg:disabled { opacity: 0.6; cursor: not-allowed; }
</style>