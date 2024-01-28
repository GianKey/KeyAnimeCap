// 假设你有一个视频数据数组，每个视频对象包含标题和链接等信息
const videoData = [
    { title: '视频1', link: 'https://example.com/video1.mp4' },
    { title: '视频2', link: 'https://example.com/video2.mp4' },
    { title: '视频2', link: 'https://example.com/video2.mp4' },
    { title: '视频2', link: 'https://example.com/video2.mp4' },
    { title: '视频2', link: 'https://example.com/video2.mp4' },
    // 添加更多视频数据...
];

const videoContainer = document.getElementById('videoContainer');

// 在页面加载时渲染视频列表
window.onload = function () {
    renderVideoList();
};

function renderVideoList() {
    videoData.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'videoItem';
        videoItem.innerHTML = `<h3>${video.title}</h3><video width="100%" controls><source src="${video.link}" type="video/mp4"></video>`;
        videoContainer.appendChild(videoItem);
    });
}