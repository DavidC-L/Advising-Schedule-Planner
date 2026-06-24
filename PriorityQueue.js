/**
 * Min-Heap Priority Queue
 *
 * Lower priority value = higher importance (served first):
 *   1 = Graduating Senior
 *   2 = Registration Issue
 *   3 = Regular Advising
 *
 * Ties in priority are broken by insertion order (first-come, first-served).
 */
class PriorityQueue {
    constructor() {
    this.heap = [];
    }

    // ---------- PUBLIC METHODS ----------

    /**
 * Compare two nodes. Returns negative if a should come before b.
 * Primary: lower priority value first.
 * Tiebreaker: earlier appointment time first.
 */
    enqueue(appointment) {
    const node = {
        data: appointment,
        priority: appointment.priority,
        appointmentTime: new Date(appointment.appointment_time).getTime()
    };
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
}

    /**
     * Remove and return the highest-priority appointment.
     * @returns {Object|null} the appointment, or null if queue is empty
     */
    dequeue() {
        if (this.heap.length === 0) return null;

        const top = this.heap[0];
        const last = this.heap.pop();

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._sinkDown(0);
        }

        return top.data;
    }

    /**
     * Look at the next appointment without removing it.
     */
    peek() {
        return this.heap.length > 0 ? this.heap[0].data : null;
    }

    /**
     * Number of appointments in the queue.
     */
    size() {
        return this.heap.length;
    }

    /**
     * True if queue is empty.
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Return all appointments in priority order without modifying the queue.
     * Useful for displaying the queue to advisors/students.
     */
    toSortedArray() {
        // Clone the heap, repeatedly dequeue the copy
        const copy = new PriorityQueue();
        copy.heap = this.heap.map(node => ({ ...node }));

        const result = [];
        while (!copy.isEmpty()) {
            result.push(copy.dequeue());
        }
        return result;
    }

    // ---------- INTERNAL HEAP OPERATIONS ----------

    /**
     * Compare two nodes. Returns negative if a should come before b.
     * Primary: lower priority value first.
     * Tiebreaker: earlier insertion order first.
     */
    _compare(a, b) {
    if (a.priority !== b.priority) {
        return a.priority - b.priority;
    }
    // Tiebreaker: within the same priority level, earliest appointment time first
    return a.appointmentTime - b.appointmentTime;
}

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this._compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
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

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}

module.exports = PriorityQueue;