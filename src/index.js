

let p = document.querySelector('p');
p.addEventListener('click', function () {
    require.ensure([], function () {
        const testFn = require('./test_module/test');
        p.innerHTML = testFn();
    })
}, false);
