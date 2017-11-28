const fs = require("fs");
const http = require("http");
const URL = require("url");
const ep = "grimoire-e2e-worker.herokuapp.com";

function exists(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            resolve(!err);
        });
    });
}

function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf-8", (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        });
    });
}

async function readJSON(path) {
    return JSON.parse(await read(path));
}

function write(path, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, { encoding: "utf-8" }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function writeJSON(path, content) {
    return write(path, JSON.stringify(content, null, 2));
}

function toBase64(str) {
    const b = new Buffer(str);
    return b.toString('base64');
}

function request(method, host, path, data, contentType = "application/json") {
    return new Promise((resolve, reject) => {
        let result = "";
        const req = http.request({
            host: host,
            path: path,
            port: 80,
            method: method,
            headers: {
                'Content-Type': contentType,
                'Content-Length': Buffer.byteLength(data),
                'Cache-Control': 'no-cache,no-store'
            }
        }, (res) => {
            res.setEncoding("utf-8");
            res.on("close", () => {
                resolve();
            });
            res.on("error", (err) => {
                reject(err);
            });
            res.on("data", (data) => {
                result += data;
            });
        }).on("close", () => {
            resolve(result);
        });
        req.write(data);
        req.end();
    });
}


function btoa(str) {
    var buffer;
    if (Buffer.isBuffer(str)) {
        buffer = str;
    }
    else {
        buffer = new Buffer(str.toString(), 'binary');
    }

    return buffer.toString('base64');
};

function deflate(val) {
    val = encodeURIComponent(val); // UTF16 → UTF8
    val = btoa(val); // base64エンコード
    return val;
}


async function uploadAndGetShortName(id, expire, cachedSignedAddr) {
    const pkgJson = await read("./package.json");
    const pkgJsonObj = JSON.parse(pkgJson);
    let name = pkgJsonObj.name;
    let shortName;
    if (name === "grimoirejs") {
        name = "grimoire";
        shortName = "grimoirejs";
    } else {
        const regexedName = /grimoirejs-(.+)/.exec(name);
        name = "grimoire-" + regexedName[1];
        shortName = regexedName[1];
    }
    const files = await Promise.all([read(`./register/${name}.js`), read(`./register/${name}.js.map`)]);
    const ct = ["text/javascript", "text/plain"];
    let addr;
    if (expire <= Date.now()) {
        addr = JSON.parse(await request("GET", ep, `/debugAddr/${id}/${name}`, ""));
        const cfg = await readJSON(".grimoire");
        cfg.cachedSignedAddr = addr;
        cfg.expire = Date.now() + 1000 * 60 * 60 * 24 * 6;
        await writeJSON(".grimoire", cfg);
        console.log("SignedURL updated");
    } else {
        addr = cachedSignedAddr;
    }
    const uploads = [addr["js"], addr["map"]];
    await Promise.all(uploads.map(u => URL.parse(u)).map((p, i) => request("PUT", p.host, p.path, files[i], ct[i])));
    return shortName;
}

async function configure() {
    if (!await exists(".grimoire")) {
        const id = Math.random().toString(36).slice(-8)
        await writeJSON(".grimoire", {
            id,
            arg: [],
            expire: 0,
            configAddr: {

            }
        });
    }
    return await readJSON(".grimoire");
}

async function main() {
    const { id, arg, expire, cachedSignedAddr } = await configure();
    const shortName = await uploadAndGetShortName(id, expire, cachedSignedAddr);
    let param = `${shortName}=staging-${id}`;
    console.log(`http://${ep}/?arg=${toBase64(param)}`);
}

main();