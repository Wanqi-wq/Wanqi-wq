<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input 
        v-model="listQuery.title" 
        placeholder="书名"
        style="width:200px"
        class="filter-item"
        clearable 
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"/>
      <el-input 
        v-model="listQuery.author" 
        placeholder="作者"
        style="width:200px"
        class="filter-item"
        clearable 
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"/>
      <el-select
        v-model="listQuery.category"
        placeholder="分类"
        clearable
        class="filter-item"
        @change="handleFilter">
        <el-option 
          v-for="item in categoryList"
          :value="item.label" 
          :key="item.value" 
          :label="item.label+'('+item.num+')'">
        </el-option>
      </el-select>
      <el-button 
        v-waves
        class="filter-item" 
        type="primary" 
        icon="el-icon-search"
        style="margin-left:10px"
        @click="handleFilter">查询</el-button>
      <el-button 
        v-waves
        class="filter-item" 
        type="primary" 
        icon="el-icon-edit"
        style="margin-left:5px"
        @click="handleCreate">新增
      </el-button>
      <el-checkbox v-model="showCover"
        @click="changeShowCover"
        style="margin-left:5px">显示封面
      </el-checkbox>
    </div>
    <el-table 
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit 
      hightlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange">
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80">
      </el-table-column>
      <el-table-column
        label="书名"
        align="center"
        width="150">
        <template slot-scope="{row:{titleWrapper}}">
          <span v-html="titleWrapper"></span>
        </template>
      </el-table-column>
      <el-table-column
        label="作者"
        align="center"
        width="150">
        <template slot-scope="{row:{authorWrapper}}">
          <span v-html="authorWrapper"></span>
        </template>
      </el-table-column>
      <el-table-column label="出版社" prop="publisher" width="150" align="center">
      </el-table-column>
      <el-table-column label="分类" prop="categoryText" width="100" align="center">
      </el-table-column>
      <el-table-column label="语言" prop="language"  align="center">
      </el-table-column>
      <el-table-column 
      label="封面"
      v-if="showCover"
      width="150" 
      align="center">
        <template slot-scope="{row :{cover}}">
          <a :href="cover" target="_blank">
            <img :src="cover" style="width:120px;height:180px"></img>
          </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="fileName" width="100" align="center"></el-table-column>
      <el-table-column label="封面路径" prop="coverPath" width="100" align="center">
        <template slot-scope="{row:{coverPath}}">
          <span>{{coverPath | valueFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="解压路径" prop="unzipPath" width="100" align="center">
        <template slot-scope="{row:{unzipPath}}">
          <span>{{unzipPath | valueFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件路径" prop="filePath" width="100" align="center">
        <template slot-scope="{row:{filePath}}">
          <span>{{filePath | valueFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传人" prop="createUser" width="100" align="center">
        <template slot-scope="{row:{createUser}}">
          <span>{{createUser | valueFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" prop="createDt" width="100" align="center">
        <template slot-scope="{row:{createDt}}">
          <span>{{createDt | timeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120" align="center">
        <template slot-scope="{row}">
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)"></el-button>
          <el-button type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(row)"></el-button>
        </template>
        
      </el-table-column>
    </el-table>
    <pagination 
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
      />
  </div>
</template>

<script>
import Pagination from '../../components/Pagination/index'
import waves from '../../directive/waves/waves'
import { getCategory, listBook, deleteBook } from '../../api/book'
import {parseTime } from '../../filters/index'
export default {
  data() {
    return {
      listQuery:{
      },
      showCover: false,
      categoryList: [],
      tableKey: 0,
      listLoading: true,
      list: [],
      total:0,
      defaultSort:{}

    }
  },
  created() {
    this.parseQuery()
  },
  mounted() {
    this.getList()
    this.getCategoryList()
  },
  components:{
    Pagination
  },
  directives:{
    waves
  },
  filters:{
    valueFilter(value) {
      return value || '无'
    },
    timeFilter(time) {
      return time ? parseTime(time,'{y}-{m}-{d} {h}:{i}') : '无'
    }
  },
  beforeRouteUpdate(to, from ,next) {
    //监听路由的变化
    if(to.path === from.path) {
      const newQuery = Object.assign({},to.query)
      const oldQuery = Object.assign({},from.query)
      if(JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      this.getList()
      }
    }
    
    console.log('ffffff')
    next()
  },
  methods:{
    handleDelete(row) {
      //删除电子书
      this.$confirm('此操作将永久删除该电子书，是否继续?','提示',{
        conformButtonText:'确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //点击确定
        deleteBook(row.fileName).then(response => {
          this.$notify({
            title:'成功',
            message:response.msg || '删除成功',
            type:'success',
            duration:2000
          })
          //删除成功后，刷新列表
          this.getList()
        })
      })
    },
    refresh() {
      this.$router.push({
        path:'/book/list',
        query:this.listQuery
      })
    },
    parseQuery() {
      let sort = '+id'
      const listQuery = {
        page: 1,
        pageSize: 20,
        sort
      }
      //解析url中的query
      const query = Object.assign({},this.$route.query)
      if(query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      this.defaultSort = {
      prop:sortColumn,
      order: sortSymbol === '+' ? 'ascending' : 'descending'
    }
      this.listQuery = { ...listQuery,...query}
    },
    
    handleUpdate(row) {
      this.$router.push(`/book/edit/${row.fileName}`)
    },
    sortChange(data) {
      //排序
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy(prop, order) {
      if((order === 'ascending')) {
        this.listQuery.sort = `+${prop}`
      }else{
        this.listQuery.sort = `-${prop}`
      }
      //每一次排序，进行一次请求
      this.handleFilter()
    },
    wrapperKeyWord(k, v) {
      function hightlight(value) {
        return `<span style="color:#1890ff">${value}</span>`
      }
      if(!this.listQuery[k]){
        return v
      }else {
        return v.replace(new RegExp(this.listQuery[k],'gi'),v => hightlight(v))
      }
    },
    getList() {
      this.listLoading = true;
      //获取电子书列表
      listBook(this.listQuery).then( response=> {
        const {list, count } = response.data 
        this.list = list
        this.total = count
        this.listLoading = false
        this.list.forEach(book => {
          book.titleWrapper = this.wrapperKeyWord('title', book.title)
          book.authorWrapper = this.wrapperKeyWord('author', book.author)
        })
      })
    },
    getCategoryList() {
      getCategory().then(response => {
        this.categoryList = response.data
      })
    },
    handleFilter() {
      //请求数据
     // this.parseQuery()
      this.listQuery.page = 1
      this.refresh()
      //this.getList()
    },
    handleCreate() {
      this.$router.push('/book/create')
    },
    changeShowCover(value) {
      this.showCover = value;
    }
  }
}
</script>

<style>

</style>