<template>
  <div class="product-edit">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>{{ isEdit ? '编辑商品' : '新增商品' }}</h2>
        <p>{{ isEdit ? '修改商品信息' : '填写商品信息并创建' }}</p>
      </div>
      <button class="ghost-btn" @click="$router.back()">← 返回</button>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="edit-form"
      >
        <!-- ============ 基础信息 ============ -->
        <div class="form-section">
          <div class="section-title">基础信息</div>

          <el-form-item label="商品标题" prop="title">
            <el-input
              v-model="form.title"
              maxlength="128"
              show-word-limit
              placeholder="请输入商品标题"
            />
          </el-form-item>
          <el-form-item label="商品类型" prop="category">
            <el-select v-model="form.category" placeholder="请选择商品类型" style="width: 100%">
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>

          <el-form-item label="副标题">
            <el-input
              v-model="form.subTitle"
              maxlength="256"
              show-word-limit
              placeholder="选填"
            />
          </el-form-item>

          <!-- 封面图上传 -->
          <el-form-item label="封面图">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="customUpload"
              accept="image/*"
            >
              <img v-if="form.coverImg" :src="form.coverImg" class="cover-preview" />
              <div v-else class="upload-placeholder">
                <span class="plus">+</span>
                <span class="tip">上传封面</span>
              </div>
            </el-upload>
            <div v-if="form.coverImg" class="cover-actions">
              <a class="action-link" @click="form.coverImg = ''">移除</a>
            </div>
          </el-form-item>

          <el-form-item label="商品详情">
            <el-input
              v-model="form.detail"
              type="textarea"
              :rows="4"
              placeholder="选填"
            />
          </el-form-item>
        </div>

        <!-- ============ 价格与库存 ============ -->
        <div class="form-section">
          <div class="section-title">价格与库存</div>

          <div class="form-row">
            <el-form-item label="原价" prop="price" class="flex-1">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="库存" prop="stock" class="flex-1">
              <el-input-number
                v-model="form.stock"
                :min="0"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="form-actions">
          <button type="button" class="ghost-btn-lg" @click="$router.back()">取消</button>
          <button
            type="button"
            class="primary-btn-lg"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>

import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProduct, saveProduct } from '../../api/merchant'
import { uploadToOss } from '../../utils/oss'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const formRef = ref()

const categories = ['数码', '家电', '服饰', '美妆', '食品', '其他']

const form = reactive({
  id: null,
  title: '',
  subTitle: '',
  coverImg: '',
  detail: '',
  price: 0,
  stock: 0,
  category: '其他',
})

const rules = {
  title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
  price: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
}

async function load() {
  if (!isEdit.value) return
  try {
    const res = await getProduct(route.params.id)
    const data = res.data || res
    Object.assign(form, {
      id: data.id,
      title: data.title,
      subTitle: data.subTitle,
      coverImg: data.coverImg,
      detail: data.detail,
      price: data.price,
      stock: data.stock,
      category: data.category || '其他',
    })
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

async function submit() {
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  submitting.value = true
  try {
    await saveProduct(form)
    ElMessage.success('保存成功')
    router.push('/merchant/products')
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片不能超过 5MB')
    return false
  }
  return true
}

async function customUpload({ file }) {
  try {
    const url = await uploadToOss(file)
    form.coverImg = url
    ElMessage.success('上传成功')
  } catch (e) {
    console.error('OSS 上传失败', e)
    ElMessage.error('上传失败：' + (e.message || '请稍后重试'))
  }
}

onMounted(load)
</script>


<style scoped>
.product-edit { max-width: 900px; }

/* ============ 页头 ============ */
.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 13px;
  color: #999;
}

.ghost-btn {
  padding: 9px 18px;
  background: #fff;
  color: #333;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.ghost-btn:hover {
  border-color: #000;
  color: #000;
}

/* ============ 表单卡片 ============ */
.form-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 32px 36px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #000;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 20px;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #00d4ff, #7b2ff7);
  border-radius: 2px;
}

/* ============ 表单元素 ============ */
:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
  padding-bottom: 6px;
}

.form-row {
  display: flex;
  gap: 24px;
}

.flex-1 { flex: 1; }

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e5e5 inset;
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #bbb inset;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #000 inset !important;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 12px;
  padding-right: 42px;
}

/* ============ 封面上传 ============ */
.cover-uploader :deep(.el-upload) {
  width: 120px;
  height: 120px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafafa;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #00d4ff;
  background: #f0fbff;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #999;
}

.plus {
  font-size: 28px;
  line-height: 1;
  font-weight: 300;
}

.tip {
  font-size: 12px;
}

.cover-actions {
  margin-top: 8px;
}

.cover-actions .action-link {
  font-size: 12px;
  color: #ff4d4f;
  cursor: pointer;
  transition: color 0.2s;
}

.cover-actions .action-link:hover {
  color: #ff7875;
  text-decoration: underline;
}

/* ============ 底部按钮 ============ */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.ghost-btn-lg, .primary-btn-lg {
  padding: 11px 28px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s;
}

.ghost-btn-lg {
  background: #fff;
  color: #333;
  border: 1px solid #e5e5e5;
}

.ghost-btn-lg:hover {
  border-color: #000;
  color: #000;
}

.primary-btn-lg {
  background: #000;
  color: #fff;
  border: none;
}

.primary-btn-lg:hover:not(:disabled) {
  background: #1a1a1a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.primary-btn-lg:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>