// 假设你有一个视频数据数组，每个视频对象包含标题和链接等信息
const { default: axios } = require("axios");
const fs = require('fs');
const FormData = require('form-data');
const { ipcRenderer } = require("electron");


var default_protocol = 'http://';
var default_hostname = '127.0.0.1';
var default_port = 8000; 
var path = '/video/api/get_video_list/'

const bkurl = default_protocol + default_hostname + ':' + default_port ;
//const { ipcRenderer } = require('electron');

var videoContainers = document.querySelectorAll('div.videoItem');
async function fetchData() {
    // try {
    //   const response = await fetch(url);
    //   const data = await response.json();
    //   console.log(data);
    // } catch (error) {
    //   console.error('Error:', error);
    // }
    fetch(bkurl+path)
    .then(response => response.json())
    .then(data => {
        const videoListElement = document.getElementById('videoContainer');
        data.videos.forEach((video,index) => {
            const videoItem = document.createElement('div');
            if(index == 0){
              videoItem.classList.add('highlighted');
            }
          // videoItem.onclick="highlightVideo(this)"
            videoItem.classList.add( 'videoItem')
            videoItem.innerHTML = `<video id="${video.id}"  src="${bkurl+video.url}" class = "videoself" controls></video> <p style="text-align: center;">${video.title}</p>`;
            videoListElement.appendChild(videoItem);
        });
    })
    .then(()=>{
     videoContainers = document.querySelectorAll('div.videoItem');
     videoslefs = document.querySelectorAll('video.videoself');
      videoContainers.forEach(videoContainer => {
        videoContainer.addEventListener("click", () =>{
          highlightVideo(videoContainer);
      });
    });
    })
    .catch(error => console.error('Error fetching video list:', error));
  }



var videoslefs = document.querySelectorAll('video.videoself');


  // 点击事件处理函数
  function highlightVideo(clickedVideo) {
    // 移除所有视频容器的高亮状态
    videoContainers.forEach(videoContainer => {
        videoContainer.classList.remove('highlighted');
    });

    // 将点击的视频容器设置为高亮状态
    clickedVideo.classList.add('highlighted');
    
   // eventEmitter.emit('videolisttoframework', clickedVideo.getElementsByTagName('video')[0].src);
   const videoData = {
    src: clickedVideo.getElementsByTagName('video')[0].src,
    id: clickedVideo.getElementsByTagName('video')[0].id
  };
    ipcRenderer.send("videolisttoframework",(videoData))
   
}



// const videoData = [
//     { title: '视频1', link: 'https://example.com/video1.mp4' },
//     { title: '视频2', link: 'https://example.com/video2.mp4' },
//     { title: '视频2', link: 'https://example.com/video2.mp4' },
//     { title: '视频2', link: 'https://example.com/video2.mp4' },
//     { title: '视频2', link: 'https://example.com/video2.mp4' },
//     // 添加更多视频数据...
// ];

// const videoContainer = document.getElementById('videoContainer');


// // 在页面加载时渲染视频列表
window.onload = function () {
    renderVideoList();
};

function renderVideoList() {
    fetchData() ;

    // videoData.forEach(video => {
    //     const videoItem = document.createElement('div');
    //     videoItem.className = 'videoItem';
    //     videoItem.innerHTML = `<h3>${video.title}</h3><video width="100%" controls><source src="${video.link}" type="video/mp4"></video>`;
    //     videoContainer.appendChild(videoItem);
    // });
}