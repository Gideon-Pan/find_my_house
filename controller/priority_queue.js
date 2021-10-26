class Qelement {
  constructor(id, priority) {
    this._id = id
    this._priority = priority
    this._index
  }
  id() {
    return this._id
  }
  priority() {
    return this._priority
  }
  setPriority(priority) {
    this._priority = priority
  }
  _addIndex(index) {
    this._index = index
  }
  _changeIndex(index) {
    this._index = index
  }

  getIndex() {
    return this._index
  }
}

class PQ {
  constructor() {
    this._queue = [0]
    this._size = 0
    this._idMap = {}
  }
  _getParentIndex(current_index) {
    return Math.floor(current_index / 2)
  }
  _getLeftChildIndex(current_index) {
    return current_index * 2
  }
  _getRightChildIndex(current_index) {
    return current_index * 2 + 1
  }
  getElementById(id) {
    return this._idMap[id]
  }
  _swap(qelement1, qelement2) {
    // const index1
    const index1 = qelement1.getIndex()
    const index2 = qelement2.getIndex()
    const tmp = this._queue[index1]
    this._queue[index1] = this._queue[index2]
    this._queue[index2] = tmp
    qelement1._changeIndex(index2)
    qelement2._changeIndex(index1)
  }
  _swapByIndex(index1, index2) {
    const qelement1 = this._queue[index1]
    const qelement2 = this._queue[index2]
    const tmp = this._queue[index1]
    this._queue[index1] = this._queue[index2]
    this._queue[index2] = tmp
    qelement1._changeIndex(index2)
    qelement2._changeIndex(index1)
  }

  sink(qelement) {
    let current_index = qelement._index
    while (1) {
      const leftChildIndex = this._getLeftChildIndex(current_index)
      // console.log('leftChildIndex: ', leftChildIndex);
      const rightChildIndex = this._getRightChildIndex(current_index)
      // console.log('rightChildIndex: ', rightChildIndex);
      let priorityChildIndex

      if (!this._queue[leftChildIndex]) {
        break
      } else if (!this._queue[rightChildIndex]) {
        priorityChildIndex = leftChildIndex
      } else {
        priorityChildIndex =
          this._queue[leftChildIndex]._priority <
          this._queue[rightChildIndex]._priority
            ? leftChildIndex
            : rightChildIndex
      }
      if (
        this._queue[current_index]._priority >
        this._queue[priorityChildIndex]._priority
      ) {
        this._swap(this._queue[current_index], this._queue[priorityChildIndex])
        current_index = priorityChildIndex
        continue
      }
      break
    }
  }

  swim(qelement) {
    let current_index = qelement._index
    let parentIndex = this._getParentIndex(current_index)
    while (
      qelement._priority < this._queue[parentIndex]._priority &&
      current_index > 1
    ) {
      // console.log(current_index)
      const tmp = qelement
      // this._queue[current_index] = this._queue[parentIndex]
      // this._queue[parentIndex] = tmp
      // current_index = parentIndex
      this._swap(this._queue[current_index], this._queue[parentIndex])
      current_index = parentIndex
      parentIndex = this._getParentIndex(parentIndex)
    }
  }

  enqueue(id, priority) {
    // console.log(this._idMap)
    const qelement = new Qelement(id, priority)
    const length = this._queue.length
    // console.log('length: ', length);
    let current_index = length
    qelement._addIndex(current_index)
    this._queue.push(qelement)
    if (this._idMap[id]) {
      // console.log(this._idMap)
      // console.log(id)
      throw new Error('repeat id into pq')
    }

    this._idMap[id] = qelement

    // console.log(qelement.priority())
    // console.log(current_index)
    // console.log(parentIndex)
    // console.log('.')
    this.swim(qelement)
    this._size++
  }

  dequeue() {
    // console.log(this._queue.length)
    // if (this._queue.length === 1) {
    if (this._size === 0) {
      throw new Error('deque from empty queue')
    }
    const deleteElement = this._queue[1]
    // console.log(this._queue);
    // this._queue[1] = this._queue[this._queue.length - 1]
    // this._queue[1]._changeIndex(1)
    this._swapByIndex(1, this._queue.length - 1)
    const deleteId = deleteElement._id
    delete this._idMap[deleteId]
    this._queue.pop()

    let current_index = 1
    let child
    // while (1) {
    //   const leftChildIndex = this._getLeftChildIndex(current_index)
    //   // console.log('leftChildIndex: ', leftChildIndex);
    //   const rightChildIndex = this._getRightChildIndex(current_index)
    //   // console.log('rightChildIndex: ', rightChildIndex);
    //   let priorityChildIndex

    //   if (!this._queue[leftChildIndex]) {
    //     break
    //   } else if (!this._queue[rightChildIndex]) {
    //     priorityChildIndex = leftChildIndex
    //   } else {
    //     priorityChildIndex = this._queue[leftChildIndex]._priority < this._queue[rightChildIndex]._priority ? leftChildIndex :rightChildIndex
    //   }
    //   // console.log('this._queue[priorityChildIndex]: ', this._queue[priorityChildIndex]);

    //   // console.log(leftChildIndex)
    //   // console.log(this._queue[current_index]._priority > this._queue[leftChildIndex]._priority)

    //   if (this._queue[current_index]._priority > this._queue[priorityChildIndex]._priority) {

    //     // console.log(priorityChildIndex)
    //     // console.log(this._queue[priorityChildIndex])
    //     // console.log(this._queue[current_index])
    //     // console.log('.')

    //     // const tmp = this._queue[current_index]
    //     // this._queue[current_index] = this._queue[priorityChildIndex]
    //     // this._queue[priorityChildIndex] = tmp
    //     this._swap(this._queue[current_index], this._queue[priorityChildIndex])
    //     current_index = priorityChildIndex
    //     continue
    //   }
    //   break

    //   // // console.log('this._queue.length[leftChildIndex]: ', this._queue[leftChildIndex]);
    //   // if (this._queue[leftChildIndex] && this._queue[current_index]._priority > this._queue[leftChildIndex]._priority) {

    //   //   console.log('left')
    //   //   console.log(this._queue[leftChildIndex])
    //   //   console.log(this._queue[current_index])
    //   //   console.log('.')
    //   //   const tmp = this._queue[current_index]
    //   //   this._queue[current_index] = this._queue[leftChildIndex]
    //   //   this._queue[leftChildIndex] = tmp
    //   //   current_index = leftChildIndex
    //   //   continue
    //   // }
    //   // if (this._queue[rightChildIndex] && this._queue[current_index]._priority > this._queue[rightChildIndex]._priority) {
    //   //   console.log('right')
    //   //   const tmp = this._queue[current_index]
    //   //   this._queue[current_index] = this._queue[rightChildIndex]
    //   //   this._queue[rightChildIndex] = tmp
    //   //   current_index = leftChildIndex
    //   //   continue
    //   // }
    //   // break
    // }
    this._size--
    if (this._size > 0) {
      this.sink(this._queue[1])
    }
    return deleteElement
  }
  peek() {
    if (this._size === 0) {
      return null
    }
    return this._queue[1]
  }
  size() {
    return this._size
  }
}

async function test() {
  const pq = new PQ()

  pq.enqueue('id1', 5)
  pq.enqueue('id2', 9)
  // console.log(pq._queue)
  pq.enqueue('id3', -4)
  // console.log(pq._queue)
  pq.enqueue('id4', 4)
  // console.log(pq._queue)

  pq.enqueue('id5', 19)
  pq.enqueue('id6', -2)
  pq.enqueue('id7', 39)
  pq.enqueue('id8', -22)
  pq.enqueue('id9', 1)
  pq.enqueue('id10', -1)
  pq.enqueue('id11', 220)
  pq.enqueue('id12', 11)
  pq.enqueue('id13', -14)
  pq.enqueue('id14', 7)
  pq.enqueue('id15', 0)
  pq.enqueue('id16', 1)
  pq.enqueue('id17', 1)
  pq.enqueue('id18', 7)
  // console.log(pq._queue)
  // console.log(pq._queue)

  // console.log(pq._idMap)

  // console.log('pq.getElementById("id12"): ', pq.getElementById("id12"));

  pq.peek()
  // console.log('peeking...', pq.peek());
  // console.log(pq._queue)
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())
  console.log(pq.dequeue())

  // console.log(pq.dequeue())
}

module.exports = {
  PQ
}
