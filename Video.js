const mongoose = require('mongoose');

const videoSchema = new mongoose.Sechema({
    title: {type: String, required: true },
    description: {type:String },
    videoPath: {type: String, required: true },
    likes: {type: Number, default: 0},
    comments: [
        {
            user: {type: String, required: true },
            text: {type: String, required: true },
            timestamp: {type: Date, default: Date.now},
        }
    ],
    tags: [String],
    category: {type: String },
    uploadedBy: {type: String},
    uploadDate: {type: Date, default: Date.now },
});

videoSchema.virtual('likeRatio').get(function () {
    return this.likes > 0 ? this.likes / (this.views || 1) : 0;
});

videoSchema.pre('save', function (next) {
    this.title = this.title.trim();
    next();
});

module.exports = mongoose.model('Video', videoSchema);