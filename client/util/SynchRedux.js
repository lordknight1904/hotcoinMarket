function timestampAction(action) {
  return {
    action,
    time: Date.now()
  }
}

function storageMiddleware() {
  return () => next => action
  {
    const stampedAction = timestampAction(action);

    //localStorage.setItem('STORAGE-KEY', JSON.stringify(stampedAction));

    next(action);
  }
}
export function syncRedux(next) {
  console.log('sync');
  next();
}
