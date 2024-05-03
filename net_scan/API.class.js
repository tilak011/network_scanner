const express = require('express');
const bodyParser = require('body-parser');

class API {
    constructor() {
        this.method = '';
        this.endpoint = '';
        this.verb = '';
        this.args = [];
        this.file = null;
    }

    processRequest(req) {
        this.args = req.url.split('/').filter(Boolean);
        this.endpoint = this.args.shift();

        if (this.args.length && !isNaN(parseInt(this.args[0]))) {
            this.verb = this.args.shift();
        }

        this.method = req.method;
        if (req.headers['x-http-method']) {
            switch (req.headers['x-http-method']) {
                case 'DELETE':
                    this.method = 'DELETE';
                    break;
                case 'PUT':
                    this.method = 'PUT';
                    break;
                default:
                    throw new Error("Unexpected Header");
            }
        }

        switch (this.method) {
            case 'DELETE':
            case 'POST':
                this.request = this.cleanInputs(req.body);
                break;
            case 'GET':
                this.request = this.cleanInputs(req.query);
                break;
            case 'PUT':
                this.request = this.cleanInputs(req.query);
                this.file = req.body;
                break;
            default:
                throw new Error('Invalid Method');
        }
    }

    processAPI() {
        if (typeof this[this.endpoint] === 'function') {
            return this.response(this[this.endpoint](this.args));
        }
        return this.response(`No Endpoint: ${this.endpoint}`, 404);
    }

    response(data, status = 200) {
        return {
            status: status,
            data: data
        };
    }

    cleanInputs(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.cleanInputs(item));
        } else if (typeof data === 'object') {
            let cleanInput = {};
            for (let key in data) {
                cleanInput[key] = this.cleanInputs(data[key]);
            }
            return cleanInput;
        } else {
            return typeof data === 'string' ? data.trim().replace(/<(?:.|\n)*?>/gm, '') : data;
        }
    }
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function(req, res) {
    const api = new API();
    try {
        api.processRequest(req);
        const result = api.processAPI();
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});