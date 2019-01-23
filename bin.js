#!/usr/bin/env node

const inquirer = require('inquirer');
const path = require('path');
const pathType = require('path-type');
const chalk = require('chalk');
const fs = require('fs');
const isPathInside = require('is-path-inside');
const rp = require('request-promise');
const execall = require('execall');
const replaceString = require('replace-string');
const download = require('download');
const clipboardy = require('clipboardy');

const info = msg => console.log(chalk.blue(msg));
const err = msg => console.log(chalk.red(msg));
const clipboardData = clipboardy.readSync();

const [,, inputPath] = process.argv;

if (!inputPath) {
  err('请输入下载目录 iconfont-download <path>');
  process.exit(0);
}

const downloadPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(downloadPath)) {
  err('下载目录不存在');
  process.exit(0);
}

if (!pathType.dirSync(downloadPath)) {
  err('下载目录必须为文件夹');
  process.exit(0);
}

if (!isPathInside(downloadPath, process.cwd())) {
  err('下载目录不能在当前目录外');
}

(async () => {
  const cssUrlReg = /^\/\/at\.alicdn\.com\/t\/font_.*\.css$/;
  const { url } = cssUrlReg.test(clipboardData) ? { url: clipboardData } : await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: '请输入css url(提前复制可以跳过该步骤):',
      validate(val) {
        return cssUrlReg.test(val) || 'url 必须为如下格式//at.alicdn.com/t/font_xxxx.css';
      },
    },
  ]);
  let cssStr = await rp.get(`https:${url}`).catch((e) => {
    err('css 资源下载错误，脚本已终止');
    err(e.message);
    process.exit(0);
  });
  // eslint-disable-next-line no-useless-escape
  const urlReg = /url\('(\/\/[\w|\d|\.|\/|?|=]*)/g;
  if (!urlReg.test(cssStr)) {
    err('未获取到url中资源数据');
    info(cssStr);
    process.exit(0);
  }
  const urlList = [...new Set(execall(urlReg, cssStr).map(val => val.sub[0]))];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < urlList.length; i++) {
    const val = urlList[i];
    const fileUrl = `https:${val}`;
    const dotName = val.match(/eot|woff|ttf|svg/)[0];
    const fileName = `iconfont.${dotName}`;
    // eslint-disable-next-line no-await-in-loop
    const fileData = await download(fileUrl);
    fs.writeFileSync(path.resolve(downloadPath, fileName), fileData);
    info(`${fileName}: 下载成功`);
    cssStr = replaceString(cssStr, val, fileName);
  }
  fs.writeFileSync(path.resolve(downloadPath, 'iconfont.css'), cssStr);
  info('iconfont.css写入成功');
  info('全部下载完成');
})();
