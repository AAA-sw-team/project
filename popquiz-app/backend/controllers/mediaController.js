const path = require('path');
const multer = require('multer');

// 录制内容上传配置
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/media'));
  },
  filename: function (req, file, cb) {
    const lectureId = req.params.id;
    const ext = path.extname(file.originalname);
    const ts = Date.now();
    cb(null, `lecture_${lectureId}_${ts}${ext}`);
  }
});
const uploadMedia = multer({ storage: mediaStorage });

// 讲座录制内容上传控制器
const uploadLectureMedia = [
  uploadMedia.single('media'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: '未收到录制文件' });
    }
    const mediaPath = `/uploads/media/${req.file.filename}`;
    res.json({ mediaPath });
  }
];

module.exports = {
  uploadLectureMedia
};
