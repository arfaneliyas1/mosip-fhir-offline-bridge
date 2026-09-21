// Mock Store-and-Forward Background Sync Worker
// Production implementation should use an encrypted edge-store such as SQLite + SQLCipher / AES-256 at rest.
class EncryptedEdgeQueue {
    constructor() {
        this.queue = [];
    }

    async loadPending() {
        // In production, read from encrypted SQLite/SQLCipher storage.
        return this.queue.filter(item => item.status === 'PENDING');
    }

    async markSynced(id) {
        this.queue = this.queue.map(item =>
            item.id === id ? { ...item, status: 'SYNCED' } : item
        );
    }

    async add(item) {
        this.queue.push({ ...item, status: 'PENDING' });
    }
}

class EdgeSyncWorker {
    constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.queueStore = new EncryptedEdgeQueue();
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

    async syncQueueToServer() {
        const pendingQueue = await this.queueStore.loadPending();

        if (pendingQueue.length === 0) return;

        for (const item of pendingQueue) {
            try {
                const response = await fetch('https://api.faydaverse.gov.et/fhir/v1/Bundle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });

                if (response.ok) {
                    console.log(`Synced record ${item.id} successfully.`);
                    await this.queueStore.markSynced(item.id);
                } else {
                    console.warn(`Server rejected record ${item.id}. Retrying later.`);
                }
            } catch (err) {
                console.error('Sync failed due to network drop. Pausing batch.', err);
                break;
            }
        }
    }
}
