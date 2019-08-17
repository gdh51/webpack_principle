# webpack 打包原理

>本次README会基于该仓库目录my_dist, 进行解释(该文件是打包后文件)

通过`npm run build`运行出来的 dist 目录下文件, 我们可以发现生成了两个 js 文件

```html
<script type="text/javascript" src="js/manifest.2730.js"></script>
<script type="text/javascript" src="js/index.5f4f.js"></script>
```

在`manifest`文件中定义了两个函数`webpackJsonpCallback()`与`__webpack_require__()`, 其作用分别对应的是 启动整个项目 与 加载某个模块获取其接口

## installedModules

这是一个定义在`manifest`文件中的对象变量, 用于通过模块名来查找对应模块的接口, 所有初次安装的模块都会在上面注册, 之后再次引用该模块时, 会在`installedModules`上直接调用其接口。

## webpackJsonpCallback()

这个函数主要做了三件事：

1. 挂载所有模块至 modules
2. 运行入口模块
3. 执行异步加载的模块

```js
/**
 * @param {String} chunkIds 入口文件在对应的chunksId
 * @param {Object} moreModules 全部js模块
 * @param {Array} executeModules 入口js文件模块
 * 主要做三件事, 将模块存储至全局并调用入口模块,加载异步模块
 */
window['webpackJsonp'] = function webpackJsonpCallback(
  chunkIds,
  moreModules,
  executeModules
) {
  var moduleId, result;

  // 遍历所有模块并按对应id赋值在全局模块管理区域中
  for (moduleId in moreModules) {
    if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }

  // 当有入口函数时, 按顺序加载入口函数, 返回它们的接口
  if (executeModules) {
    for (i = 0; i < executeModules.length; i++) {
      result = __webpack_require__(executeModules[i]);
    }
  }

  // 异步加载模块(非异步直接无视下面所有操作)
  var resolves = [];

  for (let i = 0; i < chunkIds.length; i++) {
    // 获取chunk的id
    chunkId = chunkIds[i];

    // 已加载的chunk时, 将其resolve函数加入resolve数组
    if (installedChunks[chunkId]) {
      resolves.push(installedChunks[chunkId][0]);
    }

    // 同时清空加载的模块
    installedChunks[chunkId] = 0;
  }

  // 执行所有的异步加载模块
  while (resolves.length) {
    resolves.shift()();
  }

  return result;
};
```

## **webpack_require**()

这个函数也就是我们编码时的`require()`函数, 它将一个模块通过 IIFE 函数封装在单独的作用域中, 并执行其逻辑然后暴露出其接口, 并在全局模块缓存上挂载其接口。

```js
function __webpack_require__(moduleId) {
  // 检查是否是已缓存的module, 是则直接取用
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports;
  }
  // 不是则新建一个module并加入缓存区中
  var module = (installedModules[moduleId] = {
    i: moduleId,
    l: false,
    exports: {}
  });

  // 执行对应id模块, this指向该模块的接口, 返回该模块接口
  modules[moduleId].call(
    module.exports,
    module,
    module.exports,
    __webpack_require__
  );

  // 将模块标记为已加载
  module.l = true;

  // 返回该模块的接口
  return module.exports;
}
```

## 同步加载模块

经过上面的代码我们可以知道, 在我们定义的`webpack.config.js`中的`entry`入口函数是通过`webpackJsonp()`加载, 该函数会从入口函数开始`require()`, 然后在其加载的模块中, 如果其中还有`require()`, 则一层一层加载。每次调用`require()`加载的模块, 都会被缓存在顶层 IIFE 函数中, 以防止重复加载。

## 异步加载模块

首先看一下异步加载时, 我们是如何编码的:

```js
// 只给出如何使用异步加载接口, 详细查看webpack文档
btn.addEventListener('click', function() {
  //只有触发事件才调动再对应的js 也就是异步加载
  require.ensure([], function() {
    const data = require('./src/js/test');
    p.innerHTML = data;
  });
});
```

通过 webpack 编码后

```js
btn.addEventListener('click', function() {
  __webpack_require__
    .e(0)
    .then(
      function() {
        const data = __webpack_require__('zFrx');
        p.innerHTML = data;
      }.bind(null, __webpack_require__)
    )
    .catch(__webpack_require__.oe);
});
```

可以明显的看出来, 在触发 DOM 事件时, 执行回调会从`__webpack_require__.e()`开始, 接下来先看看它是什么

## installedChunks
在看这个函数之前, 要知道一件事,`installedChunks`是什么？它与`installModules`一样是存在于顶级IIFE中(也可以理解为模块的全局环境), 用来缓存已异步加载模块的`Promise`对象及其`resolve/reject`函数

## **webpack_require.e()
这里要注意下面的 0 表示已成功异步加载的模块, 先记住在往下看
```js
// 缓存未安装的chunks的resolve/reject函数及其Promise对象, 当其值为0为已成功安装
var installedChunks = {
    2: 0
};

__webpack_require__.e = function requireEnsure(chunkId) {

    // 优先从缓存中获取异步模块的promise对象相关信息
    var installedChunkData = installedChunks[chunkId];

    // 0表示已成功加载, 不在重复加载, 直接返回resolve状态的promise对象执行其then()
    if (installedChunkData === 0) {
        return new Promise(function (resolve) {
            resolve();
        });
    }

    // 如果是正在加载的异步模块则直接返回其promise对象
    if (installedChunkData) {
        return installedChunkData[2];
    }

    // 当未一个新加载的异步模块时, 将其promise对象的resolve/reject缓存
    var promise = new Promise(function (resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
    });

    // 在缓存promise对象信息中第三个位置存入该promise对象
    installedChunkData[2] = promise;

    // 加入js脚本
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = "js/" + chunkId + "." + {
        "0": "7f0a",
        "1": "ad23"
    } [chunkId] + ".js";

    // 为异步加载js文件挂载成功/失败回调
    script.onerror = script.onload = onScriptComplete;

    // 在异步js文件加载失败或成功时, 解除事件
    function onScriptComplete() {
        script.onerror = script.onload = null;

        // 获取当前chunkId的状态信息
        var chunk = installedChunks[chunkId];

        // 未成功加载, 清空缓冲区中对应chunkId的信息并报错
        if (chunk !== 0) {
            if (chunk) {
                chunk[1](new Error('Loading chunk ' + chunkId + ' failed.');
            }
            installedChunks[chunkId] = undefined;
        }
    };

    // 正式异步加载模块
    head.appendChild(script);
    return promise;
};
```

总结一下该方法大约做的事情：
1. 在`installedChunks`上存放异步模块加载的信息(其promise相关信息及其是否已加载)
2. 加载对应js文件, 并监听其成功/失败回调

现在总结下**异步加载模块流程**:
1. 通过事件触发加载加载模块的功能, 此时内部通过新建`<script>`元素对应模块并创建一个`Promise`对象存放于全局变量`installedChunks`中(`__webpack_require__.e`), 被加载的模块会封装在`promise.then()`回调中,
2. 当对应js模块加载完毕后, 通过调用入口函数(`webpackJsonpCallback()`), 在入口函数中执行存放在`installedChunks`对象中对应异步模块的`Promise`对象的`resolve()`函数来执行异步加载模块的逻辑, 然后在按正常的同步策略来加载该模块。
3. 在 2 中js加载完毕后, 无论成功与否都会执行一个相同的`script.onload()`回调函数, 失败时会提示模块加载失败
4. 重复加载模块时,按情况:
   1. 已加载的模块: 会直接返回一个`resolve`的`Promise`对象然后然后执行该模块的同步策略操作
   2. 加载中模块: 直接返回该异步模块对应的`Promise`对象
