const { default: axios } = require("axios");
const fs = require('fs');
const FormData = require('form-data');


var default_protocol = 'http://';
var default_hostname = '127.0.0.1';
var default_port = 8000;

exports.start_mmpose_inference = async function(inputPath) {
    try {
      const videoFormData = new FormData();
      videoFormData.append('inputvideopath', inputPath);

  
      const path = '/vendpoints/video_mocap/predict';
      const url = default_protocol + default_hostname + ':' + default_port + path;
  
      const response = await axios.post(url, videoFormData, {
        headers: {
          ...videoFormData.getHeaders(), // 获取FormData的headers
        },
      });
  
      console.log('推理成功', response.data); // 注意这里使用response.data来获取响应内容
      return response.data; // 返回响应数据
    } catch (error) {
      console.error('推理失败', error);
      throw error; // 抛出错误以供调用方处理
    }
  };
  

  
// exports.voideUpload = async function(inputPath) {
//   try {
//     const videoFormData = new FormData();
//     videoFormData.append('fileName', inputPath.name);
//     const videoStream = fs.createReadStream(inputPath.path);
//     videoFormData.append('videoFile', videoStream);

//     const path = '/videoprocessing/video_upload/';
//     const url = default_protocol + default_hostname + ':' + default_port + path;

//     const response = await axios.post(url, videoFormData, {
//       headers: {
//         ...videoFormData.getHeaders(), // 获取FormData的headers
//       },
//     });

//     console.log('上传成功', response.data); // 注意这里使用response.data来获取响应内容
//     return response.data; // 返回响应数据
//   } catch (error) {
//     console.error('上传失败', error);
//     throw error; // 抛出错误以供调用方处理
//   }
// };
