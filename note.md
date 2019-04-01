## redux-saga一些基本概念
### Saga Helpers
`redux-saga`提供了一些辅助函数，用来当一些特定的action被调度到store时包装内部函数以生产任务（worker saga）

* takeEvery & takeLatest

### 声明式Effect

在redux-saga中，saga是通过`Generator`函数实现的，为了实现saga的逻辑，从Generator中yield出纯js对象。而这些对象就被称作`Effects`。而像`call, put`等这些创建Effect对象的方法，被称作是`effect factory`。一个Effect是一个包含供中间件执行的信息的对象。可以把这些Effects当做叫中间件做一些操作的指令。

* call: `call(fn, ...args)` or `call([obj, obj.method], arg1, arg2, ...)`

* apply: `apply(obj, obj.method, arg1, arg2, ...)`

call和apply对于那些返回promise的函数使用，而`cps`则用来处理那些node风格的函数（例如：fn(...args, callback)）

* put: dispatch action ，相当于在saga中调用`store.dispatch(action)`
* take: 阻塞当前saga，直到接收到指定的action，代码才会继续往下执行。
* fork: 类似于call effect，区别在于它不会阻塞当前saga，如同在后台运行一样，它的返回值是一个task对象。
* cancel： 针对fork方法返回的task，可以取消。

### Advanced Conepts

#### Eorror Handling

如果忘记写`try catch`进行异常捕获，那么结果会是什么样

```javascript
function* saga1() {...}
function* saga2() {throw new Error('error')}
function* saga3() {...}

function* rootSaga() {
  yield fork(saga1)
  yield fork(saga2)
  yield fork(saga3)
}

```

假设saga2出现异常，而且没有捕获异常，那么会导致整个app的崩溃。

`redux-saga`中执行`sagaMiddleWard.run(rootSaga)`或`fork(saga)`均会返回一个task对象，嵌套的task之间会存在**父子关系**。而其中某一个childTask异常了，那么它的parentTask就会收到通知先执行自身的cancel操作，再通知其他childTask同样执行cancel操作。

可以用`spawn`来替换`fork`，它们的区别在于`spawn`返回isolate task，不存在父子关系。
