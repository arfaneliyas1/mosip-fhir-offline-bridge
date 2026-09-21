// Mock Store-and-Forward Background Sync Worker
// Production implementation should use an encrypted edge-store such as SQLite + SQLCipher / AES-256 at rest.
class EncryptedEdgeQueue {
    constructor() {
        this.queue = [];
    }

    async loadPending(limit = 50, nowTs = Date.now()) {
        // In production, read from encrypted SQLite/SQLCipher storage.
        return this.queue
            .filter(item => item.status === 'PENDING' && (!item.retry_at || item.retry_at <= nowTs))
            .slice(0, limit);
    }

    async markSynced(id) {
        this.queue = this.queue.map(item =>
            item.id === id ? { ...item, status: 'SYNCED' } : item
        );
    }

    async markRetry(id, retryCount, retryAt = null) {
        this.queue = this.queue.map(item =>
            item.id === id
                ? {
                    ...item,
                    retry_count: retryCount,
                    status: 'PENDING',
                    retry_at: retryAt || Date.now()
                }
                : item
        );
    }

    async add(item) {
        this.queue.push({
            ...item,
            status: 'PENDING',
            retry_count: 0
        });
    }
}

class EdgeSyncWorker {
    constructor({ batchSize = 50, baseDelayMs = 5000, maxDelayMs = 3600000 } = {}) {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.queueStore = new EncryptedEdgeQueue();
        this.batchSize = batchSize;
        this.baseDelayMs = baseDelayMs;
        this.maxDelayMs = maxDelayMs;
        this.retryInFlight = false;
        this.initNetworkListeners();
    }

    initNetworkListeners() {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            console.log('Network detected. Flushing local offline FHIR queue...');
            this.syncQueueToServer();
        });
        window.addEventListener('offline', () => {
            console.log('Device offline. Queuing records locally.');
        });
    }

    buildBundle(batch) {
        return {
            resourceType: 'Bundle',
            type: 'transaction',
            entry: batch.map(item => ({
                resource: item.payload,
                request: {
                    method: item.action || 'POST',
                    url: item.resource_type || item.payload.resourceType
                }
            }))
        };
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async syncQueueToServer() {
        if (this.retryInFlight || !this.isOnline) return;

        const pendingQueue = await this.queueStore.loadPending(this.batchSize);
        if (pendingQueue.length === 0) return;

        const batch = this.buildBundle(pendingQueue);
        this.retryInFlight = true;

        try {
            const response = await this.sendBatch(batch);
            const statusCode = response && response.status ? response.status : 200;

            if (statusCode >= 200 && statusCode < 300) {
                for (const item of pendingQueue) {
                    await this.queueStore.markSynced(item.id);
                }
                console.log(`Batch of ${pendingQueue.length} records synced successfully.`);
                this.retryInFlight = false;
                return;
            }

            if (statusCode === 409) {
                // In a real FHIR transaction Bundle, per-entry outcomes would normally identify the exact
                // conflicting resource. This mock keeps the simplified batch-level behavior for readability.
                console.warn('Conflict detected. Marking affected records for manual review.');
                for (const item of pendingQueue) {
                    await this.queueStore.markRetry(item.id, item.retry_count + 1, Date.now() + this.calculateBackoffDelay(item.retry_count || 0));
                }
                this.retryInFlight = false;
                return;
            }

            if (statusCode >= 500 || statusCode === 0) {
                const retryDelay = this.calculateBackoffDelay(pendingQueue[0].retry_count || 0);
                console.warn(`Sync batch failed with status ${statusCode}. Retrying in ${retryDelay}ms.`);
                await this.sleep(retryDelay);
                for (const item of pendingQueue) {
                    await this.queueStore.markRetry(item.id, (item.retry_count || 0) + 1, Date.now() + retryDelay);
                }
            }
        } catch (err) {
            const retryDelay = this.calculateBackoffDelay(pendingQueue[0].retry_count || 0);
            console.error('Network error during sync. Backing off.', err);
            await this.sleep(retryDelay);
            for (const item of pendingQueue) {
                await this.queueStore.markRetry(item.id, (item.retry_count || 0) + 1, Date.now() + retryDelay);
            }
        } finally {
            this.retryInFlight = false;
            this.syncQueueToServer();
        }
    }

    calculateBackoffDelay(retryCount) {
        const base = this.baseDelayMs * Math.pow(2, retryCount);
        return Math.min(base, this.maxDelayMs);
    }

    async sendBatch(bundle) {
        if (typeof fetch === 'function') {
            const response = await fetch('https://api.faydaverse.gov.et/fhir/v1/Bundle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bundle)
            });
            return response;
        }

        // Mock fallback for Node or offline environments.
        return { status: 200 };
    }
}

if (typeof module !== 'undefined') {
    module.exports = { EdgeSyncWorker, EncryptedEdgeQueue };
}
