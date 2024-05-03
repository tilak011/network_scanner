class NetworkScanner {
    constructor(ip_add) {
        this.ip_add = ip_add;
    }

    async do_scan(start = 20, end = 25) {
        const results = [];
        const ip = this.ip_add;

        for (let port = start; port <= end; port++) {
            const { number, name, status } = await this.checkPort(ip, port);
            results.push({ number, name, status });
        }

        return results;
    }

    async do_scan_common_ports(ports) {
        const results = [];
        const ip = this.ip_add;

        for (const port of ports) {
            const { number, name, status } = await this.checkPort(ip, port);
            results.push({ number, name, status });
        }

        return results;
    }

    async checkPort(ip, port) {
        return new Promise((resolve, reject) => {
            const net = require('net');
            const client = new net.Socket();

            client.setTimeout(1000); // Timeout in milliseconds

            client.on('connect', () => {
                client.destroy();
                resolve({
                    number: port,
                    name: '', // Getting service name is not feasible in Node.js
                    status: 'open'
                });
            });

            client.on('error', (err) => {
                client.destroy();
                resolve({
                    number: port,
                    name: '',
                    status: 'closed'
                });
            });

            client.connect(port, ip);
        });
    }
}

module.exports = NetworkScanner;
