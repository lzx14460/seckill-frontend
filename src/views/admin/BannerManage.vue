<template>
  <div class="banner-manage">
    <div class="page-header">
      <div>
        <h2>轮播图 / 图片墙管理</h2>
        <p>管理首页顶部轮播 + 右侧图片墙</p>
      </div>
      <button class="primary-btn" @click="openEdit()">+ 新增</button>
    </div>

    <!-- 类型筛选 -->
    <div class="filter-bar">
      <el-select
        v-model="query.type"
        placeholder="全部类型"
        clearable
        style="width: 200px"
        @change="load"
      >
        <el-option label="顶部轮播" value="carousel" />
        <el-option label="图片墙-左列" value="wall_left" />
        <el-option label="图片墙-中列" value="wall_mid" />
        <el-option label="图片墙-右列" value="wall_right" />
      </el-select>
    </div>

    <div class="table-card">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column label="预览" width="140">
          <template #default="{ row }">
            <el-image :src="row.imageUrl" fit="cover" style="width: 100px; height: 50px; border-radius: 4px;" />
          </template>
        </el-table-column>

        <el-table-column label="类型" width="130">
          <template #default="{ row }">
            <span class="type-tag">{{ typeText(row.type) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="140">
          <template #default="{ row }">{{ row.title || '—' }}</template>
        </el-table-column>

        <el-table-column prop="linkUrl" label="跳转链接" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.linkUrl || '—' }}</template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-tag', row.status === 1 ? 'on' : 'off']">
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="right">
          <template #default="{ row }">
            <a class="action-link" @click="openEdit(row)">编辑</a>
            <a class="action-link danger" @click="handleDelete(row)">删除</a>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" :title="form.id ? '编辑' : '新增'" width="520px" align-center>
      <el-form :model="form" label-position="top">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="carousel">顶部轮播</el-radio>
            <el-radio value="wall_left">图片墙-左列</el-radio>
            <el-radio value="wall_mid">图片墙-中列</el-radio>
            <el-radio value="wall_right">图片墙-右列</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="选填" />
        </el-form-item>

        <el-form-item label="图片 URL">
          <el-upload
            class="banner-uploader"
            :show-file-list="false"
            :http-request="customUpload"
            accept="image/*"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="banner-preview" />
            <div v-else class="upload-placeholder">+ 上传图片</div>
          </el-upload>
          <el-input v-model="form.imageUrl" placeholder="或直接填图片 URL" style="margin-top: 8px" />
        </el-form-item>

        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="选填，如 /home" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <button class="ghost-btn" @click="editVisible = false">取消</button>
        <button class="primary-btn" :disabled="submitting" @click="submit">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBanners, saveBanner, deleteBanner } from '../../api/admin'
import { uploadToOss } from '../../utils/oss'

const loading = ref(false)
const list = ref([])
const editVisible = ref(false)
const submitting = ref(false)

const query = reactive({
  type: null,
})

const form = reactive({
  id: null,
  type: 'carousel',
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: 1,
})

async function load() {
  loading.value = true
  try {
    const res = await listBanners(query)
    list.value = res.data || res || []
  } finally {
    loading.value = false
  }
}

function openEdit(row) {
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, {
      id: null,
      type: 'carousel',
      title: '',
      imageUrl: '',
      linkUrl: '',
      sortOrder: 0,
      status: 1,
    })
  }
  editVisible.value = true
}

async function submit() {
  if (!form.imageUrl) {
    ElMessage.warning('请上传图片')
    return
  }
  submitting.value = true
  try {
    await saveBanner(form)
    ElMessage.success('保存成功')
    editVisible.value = false
    load()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title || row.imageUrl}」吗？`, '警告', { type: 'warning' })
  } catch (e) { return }
  await deleteBanner(row.id)
  ElMessage.success('已删除')
  load()
}

async function customUpload({ file }) {
  try {
    const url = await uploadToOss(file)
    form.imageUrl = url
    ElMessage.success('上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

function typeText(t) {
  return {
    carousel: '顶部轮播',
    wall_left: '图片墙-左列',
    wall_mid: '图片墙-中列',
    wall_right: '图片墙-右列',
  }[t] || '顶部轮播'
}

onMounted(load)
</script>

<style scoped>
.banner-manage { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px;
}
.page-header h2 { font-size: 26px; font-weight: 800; color: #000; margin-bottom: 6px; }
.page-header p { font-size: 13px; color: #999; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }

.primary-btn {
  padding: 10px 22px; background: #000; color: #fff; border: none;
  border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
}
.primary-btn:hover { background: #1a1a1a; }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ghost-btn {
  padding: 9px 18px; background: #fff; color: #333;
  border: 1px solid #e5e5e5; border-radius: 6px; font-size: 13px; cursor: pointer;
}
.ghost-btn:hover { border-color: #000; color: #000; }

.table-card { background: #fff; border-radius: 12px; border: 1px solid #eee; padding: 4px; }

.type-tag {
  display: inline-block; padding: 3px 10px;
  background: rgba(0, 168, 204, 0.08); color: #00a8cc;
  border-radius: 4px; font-size: 12px; font-weight: 600;
}

.status-tag { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.status-tag.on { color: #00a854; background: rgba(0, 168, 84, 0.08); }
.status-tag.off { color: #999; background: #f5f5f5; }

.action-link { font-size: 13px; color: #00a8cc; cursor: pointer; margin-left: 12px; }
.action-link:hover { color: #00d4ff; }
.action-link.danger { color: #ff4d4f; }
.action-link.danger:hover { color: #ff7875; }

.banner-uploader :deep(.el-upload) {
  width: 200px; height: 100px; border: 1px dashed #ddd; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: #fafafa;
}
.banner-preview { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.upload-placeholder { color: #999; font-size: 13px; }
</style>