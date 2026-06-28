/**
 * Min-Heap Priority Queue (reusable via a pluggable comparator)
 *
 * Default ordering (appointments): lower priority value = served first
 *   1 = Graduating Senior, 2 = Registration Issue, 3 = Regular Advising
 *   ties broken by earliest appointment time.
 *
 * Pass a custom comparator to reuse the same heap for other orderings
 * (e.g. ordering students by school year).
 */
class PriorityQueue {
    /**
     * @param {function} [compareFn] comparator over enqueued items;
     *        returns a negative number if a should come out before b.
     */
    constructor(compareFn) {
        this.heap = [];
        this._compareFn = compareFn || PriorityQueue.appointmentCompare;
    }
 
    // Default comparator: by priority, then first-come-first-served
    static appointmentCompare(a, b) {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.appointment_id - b.appointment_id; // lower id = created first
    }
 
    // ---------- PUBLIC METHODS ----------
 
    enqueue(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }
 
    dequeue() {
        if (this.heap.length === 0) return null;
 
        const top = this.heap[0];
        const last = this.heap.pop();
 
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return top;
    }
 
    /**
     * Remove a specific appointment by its ID, wherever it sits in the heap.
     * Returns true if removed, false if not found.
     */
    remove(appointmentId) {
        const index = this.heap.findIndex(item => item.appointment_id === appointmentId);
        if (index === -1) return false;
 
        const last = this.heap.pop();
        if (index < this.heap.length) {
            this.heap[index] = last;
            this._bubbleUp(index);
            this._sinkDown(index);
        }
        return true;
    }
 
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
 
    size() {
        return this.heap.length;
    }
 
    isEmpty() {
        return this.heap.length === 0;
    }
 
    /**
     * Return all items in priority order without modifying this queue.
     */
    toSortedArray() {
        const copy = new PriorityQueue(this._compareFn);
        copy.heap = this.heap.slice();   // shallow copy of references
 
        const result = [];
        while (!copy.isEmpty()) {
            result.push(copy.dequeue());
        }
        return result;
    }
 
    // ---------- INTERNAL HEAP OPERATIONS ----------
 
    _compare(a, b) {
        return this._compareFn(a, b);
    }
 
    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this._compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] =
                    [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }
 
    _sinkDown(index) {
        const length = this.heap.length;
 
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;
 
            if (leftIndex < length && this._compare(this.heap[leftIndex], this.heap[smallest]) < 0) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this._compare(this.heap[rightIndex], this.heap[smallest]) < 0) {
                smallest = rightIndex;
            }
 
            if (smallest === index) break;
 
            [this.heap[index], this.heap[smallest]] =
                [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
 
module.exports = PriorityQueue;
