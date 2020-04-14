<template>
  <div class="upload-container">
    <el-upload :action="action" 
    :headers="headers"
    :multiple="false"
    :limit="1"
    :before-upload="beforeUpload"
    :on-success="onSuccess"
    :on-error="onError"
    :on-remove="onRemove"
    :file-list="fileList"
    :on-exceed="onExceed"
    :disabled="disabled"
    drag
    show-file-list
    accept="application/epub+zip"
    class="image-upload"
    >
    <i class="el-icon-upload"></i>
    <div class="el-upload__text" v-if="fileList.length === 0">
      请将电子书拖入或<em>点击上传</em>
    </div>
    <div class="el-upload__text" v-else>图书已上传</div>
    </el-upload>
  </div>
    
</template>

<script>
import { getToken } from '../../../utils/auth'
export default {
  data() {
    return {
      action:`${process.env.VUE_APP_BASE_API}/book/upload`,
    }
  },
  computed: {
    headers() {
      return {
        Authorization:`Bearer ${getToken()}`
      }
    }
  },
  props:{
    disabled:{
      type: Boolean,
      default:false
    },
    fileList:{
      type:Array,
      default() {
        return []
      }
    }
  },
  components:{
  },
  methods: {
    beforeUpload(file) {
      //上传之前触发的事件
      //console.log(file)
      this.$emit('beforeUpload',file)
    },
    onSuccess(response, file) {
      //上传成功
      const { code, msg, data } =response
      if(code === 0) {
        //真正上传成功
        this.$message({
        message:msg,
        type:'success'
        })
        this.$emit('onSuccess', data)
      }else {
        //上传失败
        this.$message({
        message:(msg && `上传失败，失败原因：${msg}`)|| '上传失败' ,
        type:'error'
        })
        this.$emit('onError', file)
      }
      
    },
    onError(err) {
      //上传失败
      const errMsg = err.message && JSON.parse(err.message)
      this.$message({
        message:(errMsg.msg && `上传失败，失败原因：${errMsg.msg}`) || '上传失败',
        type:'error'
      })
      this.$emit('onError',err)
    },
    onRemove() {
      //上传之后再进行移除
      this.$message({
        message: '电子书删除成功' ,
        type:'success'
        })
        this.$emit('onRemove')
    },
    onExceed() {
      this.$message({
        message:'每次只能上传一本电子书',
        type:'warning'
      })
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
