<template>
  <el-form ref="postForm" :rules="rules" :model="postForm">
    <sticky class-name="sub-navbar draft">
      <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
      <el-button
      v-loading="loading"
      type="success"
      @click="submitForm">{{ isEdit ? '编辑电子书' : '新增电子书'}}</el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <warning :is-help="isHelp"/>
        <!-- 上传电子书组件 -->
        <el-col :span="24" >
          <ebook-upload 
          :file-list="fileList" 
          :disabled="isEdit"
          @onSuccess="onUploadSuccess"
          @onRemove="onUploadRemove"/>
          </el-col>
        <!-- 电子书的表单 -->
        <el-col :span="24">
          <el-form-item prop="title">
              <m-dinput v-model="postForm.title" :maxlength="100"
              name="name" required >
                书名
              </m-dinput>
          </el-form-item>
          <el-row>
            <el-col :span="12" >
              <el-form-item  label="作者：" :label-width="labelWidth" prop="author">
                <el-input v-model="postForm.author" placeholder="作者"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item  label="出版社：" :label-width="labelWidth" prop="publisher">
                <el-input v-model="postForm.publisher" placeholder="出版社" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言：" :label-width="labelWidth">
                <el-input v-model="postForm.language" placeholder="语言"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="根文件：" :label-width="labelWidth" prop="rootFile">
                <el-input v-model="postForm.rootFile" placeholder="根文件" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="文件路径：" :label-width="labelWidth" prop="filePath">
                <el-input v-model="postForm.filePath" placeholder="文件路径"
                disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="解压路径：" :label-width="labelWidth" prop="unzipPath">
                <el-input v-model="postForm.unzipPath" placeholder="解压路径" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="封面路径：" :label-width="labelWidth" prop="filePath">
                <el-input v-model="postForm.filePath" placeholder="封面路径"
                disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件名称：" :label-width="labelWidth" prop="originalName">
                <el-input v-model="postForm.originalName" placeholder="文件名称" disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="封面：" :label-width="labelWidth" prop="cover">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img" />
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>  
          <el-row>
            <el-col :span="24">
              <el-form-item :label-width="labelWidth" label="目录：" prop="chapterTree">
                <div v-if="postForm.chapterTree && postForm.chapterTree.length > 0" class="contents-wrapper">
                  <el-tree :data="postForm.chapterTree" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '../../../components/Sticky/index'
import Warning from './Warning'
import EbookUpload from './EbookUpload'
import MDinput from '../../../components/MDinput/index'
import { createBook, getBook, updateBook } from '../../../api/book'

const defaultForm = {
        title:'',
        author:'',
        publisher:'',
        language:'',
        rootFile:'',
        filePath: '',
        upzipPath: '',
        cover: '',
        originalName:'',
        chapterTree:[]
    
}

const fields = {
  title:'书名',
  author:'作者',
  publisher:'出版社',
  language: '语言'

}
export default {
  components:{
    Sticky,
    Warning,
    EbookUpload,
    MDinput
  },
  data() { 
    const validateRequire = (rule, value, callback) => {
    if(value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      }else {
        callback()
      }
    } 
    return {
      isHelp: false,
      postForm:{
        title:'',
        author:'',
        publisher:'',
        language:'',
        rootFile:'',
        filePath: '',
        upzipPath: '',
        cover: '',
        originalName:'',
        chapterTree:[],
        contents:''

      },
      loading: false,
      fileList: [],
      labelWidth:'120px',
      rules:{
        title:[{validator: validateRequire}],
        language:[{validator: validateRequire}],
        publisher:[{validator: validateRequire}],
        author:[{validator: validateRequire}]
      },
    }
  },
  created() {
    if(this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  props:{
    isEdit:{
      type:Boolean,
      default: false
    }
  },
  methods:{
    handleNodeClick(data) {
      if(data.text) {
        window.open(data.text)
      }
    },
    showGuide() {
      this.isHelp = !this.isHelp
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        coverPath,
        filePath,
        unzipPath,
        fileName,
        chapterTree,
        contents
      } = data
      this.postForm = {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        coverPath,
        filePath,
        unzipPath,
        chapterTree,
        fileName,
        contents,
        originalName
      }
      this.fileList = [{name:originalName, url}]
      this.defaultProps = {
        children: 'children',
        label: 'label'
      }
    },
    setDefault() {
      //清空表单
      this.$refs.postForm.resetFields()
      this.fileList = []
    },
    submitForm() {
      if(!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((isVaild,fields) => {
          if(isVaild) {
            //进行提交表单
            const book = Object.assign({}, this.postForm)
            delete book.chapterTree
            if(!this.isEdit) {
              //新增电子书
              createBook(book).then(response => {
                const { msg } =response
                this.$notify({
                  title: '操作成功',
                  message: 'success',
                  type: 'success',
                  duration: 2000
                })
                console.log('success')
                this.loading = false
                this.setDefault()
              }).catch(() => {
                this.loading = false
              })
            }else {
              //编辑电子书
              console.log('book',book)
              updateBook(book).then(response => {
                const { msg } =response
                this.$notify({
                  title: '更新成功',
                  message: 'success',
                  type: 'success',
                  duration: 2000
                })
                this.loading = false
              }).catch(() => {
                this.loading = false
              })
            }
          }else {
            //返回错误信息
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({message:message,type: 'error'})
            this.loading = false
          }
        })
      } 
    },
    getBookData(fileName) {
      //在编辑模式下，获取电子书信息填充在表单中
      getBook(fileName).then(response => {
        console.log(response)
        this.setData(response.data)
      })
    },
    onUploadSuccess(data) {
      //更新表单数据
      this.setData(data)
    },
    onUploadRemove() {
     //清空表单
    this.setDefault()
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 40px 50px 20px;
}
  .preview-img {
    width: 200px;
    height: 270px;
  }

</style>