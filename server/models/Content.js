const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  meta: {
    title: String,
    description: String
  },
  introdata: {
    title: String,
    animated: [String],
    description: String,
    your_img_url: String
  },
  dataabout: {
    title: String,
    aboutme: String
  },
  worktimeline: [{
    jobtitle: String,
    where: String,
    date: String
  }],
  skills: [{
    name: String,
    value: Number
  }],
  services: [{
    title: String,
    description: String
  }],
  dataportfolio: [{
    img: String,
    description: String,
    link: String
  }],
  contactConfig: {
    YOUR_EMAIL: String,
    YOUR_FONE: String,
    description: String
  },
  socialprofils: {
    github: String,
    facebook: String,
    linkedin: String,
    twitter: String
  },
  logotext: String
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);