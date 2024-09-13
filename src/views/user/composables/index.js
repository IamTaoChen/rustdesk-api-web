import { onMounted, reactive, watch } from 'vue'
import { list, remove, changePwd } from '@/api/user'
import { list as groups } from '@/api/group'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

export function useRepositories () {

  const listRes = reactive({
    list: [], total: 0, loading: false,
    groups: [],
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    username: '',
  })

  const getList = async () => {
    listRes.loading = true
    const res = await list(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list
      listRes.total = res.data.total
    }
  }

  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
      //由watch 触发
    }
  }

  const getGroups = async () => {
    const res = await groups({ page_size: 9999 }).catch(_ => false)
    if (res) {
      listRes.groups = res.data.list
    }
  }
  onMounted(getGroups)

  onMounted(getList)

  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)
  return {
    listRes,
    listQuery,
    handlerQuery,
    getList,
    getGroups,
  }
}

export function useToEditOrAdd () {
  const router = useRouter()
  const toEdit = (row) => {
    router.push('/user/edit/' + row.id)
  }
  const toAdd = () => {
    router.push('/user/add')
  }
  const toTag = (row) => {
    router.push('/user/tag/?user_id=' + row.id)
  }
  const toAddressBook = (row) => {
    router.push('/user/addressBook/?user_id=' + row.id)
  }
  return {
    toAdd,
    toEdit,
    toTag,
    toAddressBook
  }
}

export function useDel () {
  const del = async (id) => {
    const cf = await ElMessageBox.confirm('确定删除么?', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = remove({ id }).catch(_ => false)
    return res
  }
  return {
    del,
  }
}

export function useChangePwd () {
  const changePass = async (admin) => {
    const input = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).catch(_ => false)
    if (!input) {
      return
    }
    const confirm = await ElMessageBox.confirm('确定重置密码么？', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).catch(_ => false)
    if (!confirm) {
      return
    }
    const res = await changePwd({ id: admin.id, password: input.value }).catch(_ => false)
    if (!res) {
      return
    }
    ElMessage.success('修改成功')
  }

  return { changePass }
}
