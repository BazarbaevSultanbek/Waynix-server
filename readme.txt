Routes -> Controllers -> Services -> Model



socket 
emit("event name", data) -> socket.on('event name', callback function) -> Model -> emit('event name 2', data2) -> socket.on('event name2', callback function) -> redux.dispatch -> state changed -> re-render UI