(function (modules) {
    /**
     * @param {String} chunkIds chunks在对应的id
     * @param {Object} moreModules 全部js模块
     * @param {Array} executeModules 入口js文件模块
     * 主要做两件事, 将模块存储至全局并调用入口模块
     */
    window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
        var moduleId, result;

        // 遍历所有模块并按对应id赋值在全局模块管理区域中
        for (moduleId in moreModules) {
            if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                modules[moduleId] = moreModules[moduleId];
            }
        }

        // 当有入口函数时, 按顺序加载入口函数, 返回它们的接口
        if (executeModules) {
            for (let i = 0; i < executeModules.length; i++) {
                result = __webpack_require__(executeModules[i]);
            }
        }

        // 加载异步加载的模块
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

        // 执行所有的异步加载
        while (resolves.length) {
            resolves.shift()();
        }

        return result;
    };

    // 缓存已安装的模块
    var installedModules = {};

    // require新的模块
    function __webpack_require__(moduleId) {

        // 当是已安装的模块时直接返回其接口
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        // 否则在缓存对应模块
        var module = installedModules[moduleId] = {
            exports: {}
        };

        // 执行对应id模块, this指向该模块的接口, 返回该模块接口
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        return module.exports;
    }

    // 缓存已安装的chunks
    var installedChunks = {
        2: 0
    };

    // 异步require()方法
    __webpack_require__.e = function requireEnsure(chunkId) {

        // 优先从缓存中获取异步模块的promise对象
        var installedChunkData = installedChunks[chunkId];

        // 0表示已成功加载, 不在重复加载
        if (installedChunkData === 0) {
            return new Promise(function (resolve) {
                resolve();
            });
        }

        // 加载中的模块直接返回其promise对象
        if (installedChunkData) {
            return installedChunkData[2];
        }

        // 非入口模块时, 将其promise对象缓存
        var promise = new Promise(function (resolve, reject) {
            installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });

        // 在缓存数据数组中第三个位置存入该promise对象
        installedChunkData[2] = promise;

        // 加入js脚本
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = "js/" + chunkId + "." + {
            "0": "7f0a",
            "1": "ad23"
        } [chunkId] + ".js";

        // js文件加载成功时执行回调
        script.onerror = script.onload = onScriptComplete;

        function onScriptComplete() {
            script.onerror = script.onload = null;

            // 取出缓存但未执行promise对象
            var chunk = installedChunks[chunkId];

            // 未成功加载, 清空缓冲区chunks
            if (chunk !== 0) {
                if (chunk) {
                    chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
                }
                installedChunks[chunkId] = undefined;
            }
        };

        // 添加模块
        head.appendChild(script);
        return promise;
    };
})([]);