// Mock Store-and-Forward Background Sync Worker
class EdgeSyncWorker {
    constructor() {
        this.isOnline = navigator.onLine;
        this.initNetworkListeners();
    }

    initNetworkListeners() {
        window.addEventListener('online', () => {
            console.log("Network detected. Flushing local offline FHIR queue...");
            this.syncQueueToServer();
        });
        window.addEventListener('offline', () => {
            console.log("Device offline. Queuing records locally.");
        });
    }

    async syncQueueToServer() {
        // Fetch pending payloads from local encrypted SQLite/Realm queue
        const pendingQueue = JSON.parse(localStorage.getItem('fhir_sync_queue') || '[]');
        
        if (pendingQueue.length === 0) return;

        for (let item of pendingQueue) {
            try {
                let response = await fetch('https://api.faydaverse.gov.et/fhir/v1/Bundle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });

                if (response.ok) {
                    console.log(`Synced record ${item.id} successfully.`);
                    this.removeFromLocalQueue(item.id);
                } else {
                    console.warn(`Server rejected record ${item.id}. Retrying later.`);
                }
            } catch (err) {
                console.error("Sync failed due to network drop. Pausing batch.", err);
                break;
            }
        }
    }

    removeFromLocalQueue(id) {
        let queue = JSON.parse(localStorage.getItem('fhir_sync_queue') || '[]');
        queue = queue.filter(item => item.id !== id);
        localStorage.setItem('fhir_sync_queue', JSON.stringify(queue));
    }
}
