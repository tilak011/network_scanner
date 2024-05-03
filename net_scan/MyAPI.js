const API = require('./API.class');
const NetworkScanner = require('./networkscanner.class');
const nmap = require('node-nmap');

class MyAPI extends API {
    constructor(request) {
        super(request);

        let ip_add;
        if (request.headers['x-forwarded-for']) {
            ip_add = request.headers['x-forwarded-for'].split(',').shift();
        } else {
            ip_add = request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
        }

        this.ip_add = ip_add;

        // Removed origin for testing
        // this.origin = origin;

        // Initialize Network Scanner
        this.net_scanner = new NetworkScanner(ip_add, 50550, 55555000);
    }

    get_ip() {
        if (this.method === 'GET') {
            return this.ip_add;
        } else {
            return "Only accepts GET requests";
        }
    }

    test2() {
        if (this.method === 'GET') {
            return this.args;
        }
    }

    async scan_net_ports() {
        if (this.method === 'GET') {
            let output = {};
            if (!this.args) {
                output = await this.net_scanner.do_scan();
            } else if (this.args.length === 1) {
                output = await this.net_scanner.do_scan(this.args[0]);
            } else {
                output = await this.net_scanner.do_scan(this.args[0], this.args[1]);
            }
            return output;
        } else {
            return "This method only accepts GET requests";
        }
    }

    async scan_common_ports() {
        if (this.method === 'GET') {
            let output = {};
            const ports = [21,22,23,25,53,80,110,115,135,139,143,194,443,445,1433,3306,3389,5632,5900];
            if (!this.args) {
                output = await this.net_scanner.do_scan_common_ports(ports);
            } else {
                output = "This method doesn't accept arguments";
            }
            return output;
        } else {
            return "This method only accepts GET requests";
        }
    }

    async scan_common_ports_2() {
        // Using node-nmap library
        if (this.method === 'GET') {
            let output = {};
            const ports = [21,22,23,25,53,80,110,115,135,139,143,194,443,445,1433,3306,3389,5632,5900];
            if (!this.args) {
                const opts = {
                    flags: ['T4', 'A'],
                    range: [this.ip_add],
                    ports: ports
                };
                await nmap.scan(opts, (err, report) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    output = report;
                });
            } else {
                output = "This method doesn't accept arguments";
            }
            return output;
        } else {
            return "This method only accepts GET requests";
        }
    }
}

module.exports = MyAPI;
