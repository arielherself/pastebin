const fs = require('fs');
const crypto = require('crypto');
const express = require("express");
const httpProxy = require("http-proxy");
const ADDR = process.env.ADDR || '127.0.0.1';
const PORT = process.env.PORT || 3001;
const app = express();
const proxy = httpProxy.createProxyServer();

const MAX_DATA_LENGTH = 5000;

function isLowerCaseAndNumber(str) {
  const regex = /^[a-z0-9]+$/;
  return regex.test(str);
}

function getHour() {
    const currentDate = new Date();
    const minDate = new Date(0);
    const millisecondsPerHour = 60 * 60 * 1000;
    return Math.floor((currentDate - minDate) / millisecondsPerHour);
}

app.use(express.json());

app.post("/hash", (req, res) => {
    let {lang, value, expire} = req.body;
    if (value.length > MAX_DATA_LENGTH) {
        res.status(200).json({prompt: 'data_too_long', loc: ''});
        return;
    }
    const expire_choice = parseInt(expire);
    let hr;
    if (expire_choice === 1) {
        hr = 1;
    } else if (expire_choice === 2) {
        hr = 24;
    } else if (expire_choice === 3) {
        hr = 72;
    } else if (expire_choice === 4) {
        hr = 120;
    } else if (expire_choice === 5) {
        hr = 24 * 7;
    } else {
        res.status(200).json({prompt: 'invalid_duration', loc: ''});
        return;
    }
    value = lang + ' ' + (hr + getHour()).toString() + ' ' + value;
    const hash = crypto.createHash('sha256').update(value).digest('hex').slice(-8);
    fs.writeFile(`server/userdata/${hash}`, value, (err) => {
        if (err) {
            console.error(err);
            res.status(200).json({prompt: 'server_cannot_write', loc: ''});
        } else {
            res.status(200).json({prompt: 'ok', loc: hash});
        }
    });
});

app.post("/load", (req, res) => {
    const {hash} = req.body;
    if (!isLowerCaseAndNumber(hash)) {
        console.warn(`Invalid hash: ${hash}`);
        res.status(200).json({prompt: 'invalid_hash', value: '', lang: ''});
        return;
    }
    fs.readFile(`server/userdata/${hash}`, (err, data) => {
        if (err) {
            console.error(err);
            res.status(200).json({prompt: 'server_cannot_read', value: '', lang: ''});
        } else {
            try {
                const parts = data.toString().split(' ');
                const prev_hr = parseInt(parts[1]);
                if (getHour() > prev_hr) {
                    res.status(200).json({prompt: 'file_outdated', value: '', lang: ''});
                } else {
                    res.status(200).json({prompt: 'ok', value: parts.slice(2).join(' '), lang: parts[0]});
                }
            } catch(e) {
                console.error(e);
                res.status(200).json({prompt: 'file_damaged', value: '', lang: ''});
            }
        }
    });
});

app.all('*', (req, res) => {
    proxy.web(req, res, { target: 'http://localhost:3000' });
});

app.listen(PORT, ADDR, () => {
    console.log(`Server listening on ${PORT}`);
});