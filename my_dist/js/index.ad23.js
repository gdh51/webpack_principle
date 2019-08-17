webpackJsonp([1], {
    "JkW7": (function (module, exports, __webpack_require__) {
        const p = document.querySelector('.p');
        const btn = document.querySelector('.btn');

        btn.addEventListener('click', function () {
            __webpack_require__.e(0).then((function () {
                const data = __webpack_require__("zFrx");
                p.innerHTML = data;
            }).bind(null, __webpack_require__)).catch(__webpack_require__.oe)
        })
    })
}, ["JkW7"]);