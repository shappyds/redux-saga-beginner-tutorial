import { delay } from 'redux-saga'
import { call, put, takeEvery, take, cancel, cancelled, fork } from 'redux-saga/effects'

/**
 * put, call是所谓的Effect，Effects是纯js对象，里面包含了中间件需要完成的指令。当中间件检索由saga yield的Effect时，saga会暂停直到Effect完成
 */

export function* helloSaga() {
  console.log('Hello Saga!')
}
// worker saga
export function* incrementAsync() {
  // yielded object是一种由中间件(saga middleward)解释的指令。
  yield call(delay, 1000) // => { CALL: {fn: delay, args: [1000] }
  // put指示中间件发送INCREMENT动作
  yield put({type: 'INCREMENT'}) // => { PUT: {type: 'INCREMENT'}}
}
// watcher saga, create a new incrementAsync task on each INCREMENT_ASYNC
export function* watchIncrementAsync() {
  // takeEvery是redux-saga提供的辅助函数，用来监听分发出的特定动作，然后每次都调用incrementAsync
  yield takeEvery('INCREMENT_ASYNC', incrementAsync)
}

function* bgSync() {
  try {
    while(true) {
      yield put({type: 'REQUEST_START'})
      yield delay(2000)
      console.log('start');
      yield put({type: 'REQUEST_SUCCESS'})
      yield delay(3000)
      console.log('start2');
    }
  } catch (error) {
    yield put({type: 'REQUEST_ERROR'})    
  } finally {
    if(yield cancelled()) {
      yield put({ type: 'SYNC_CANCELLED'})
      console.log('cancel');
    }
  }
}

export function* startSync() {
  while(yield take('SYNC_START')) {
    const bgSyncTask = yield fork(bgSync)
    // listen stop action
    yield take('SYNC_STOP')
    yield cancel(bgSyncTask)
  }
}

// single entry point to start all Sagas at once
export default function* rootSaga() {
  yield [
    helloSaga(),
    watchIncrementAsync(),
    startSync()
  ]
}
