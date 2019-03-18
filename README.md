## iconfont-download

> 思路参考https://blog.csdn.net/shentibeitaokong/article/details/82463941

下载根据生成的 css url，自动下载 iconfont.cn 项目中的其他资源。

![获取cssurl](./imgs/1.png)

## 用法

1. 全局安装 `npm i iconfont-dl -g`
2.  输入命令下载 `iconfont-download <path to icons>`
3. 根据提示输入 css url 即可。

## 注意

1. 获取 css url 前，如果有更新提示，请点击更新，不然下载的 iconfont 还是之前的。
2. 该工具并不会获取到 iconfont.js 这个文件，如果需要只能从下载压缩包中获取。

## TODO

1. 自动自动的获取 css url
