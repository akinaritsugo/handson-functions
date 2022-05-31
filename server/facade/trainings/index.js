// var readOut = async function (req) {
//   return new Promise((resolve, reject) => {
//     var raw = "";
//     req.on("data", (chunk) => {
//       raw += chunk;
//     });
//     req.on("finish", () => {
//       console.log(raw);
//       resolve(raw);
//     });
//     req.on("error", (err) => {
//       reject(err);
//     });
//   });
// };

// module.exports = async function (context, req) {
//   context.log('JavaScript HTTP trigger function processed a request.');

//   // const name = (req.query.name || (req.body && req.body.name));
//   // const responseMessage = name
//   //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
//   //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

//   // context.bindings.outImageBlob = "";
//   console.log(`rawBody : ${req.rawBody}`);
//   var raw = await readOut(req);

//   return {
//     status: 200,
//     body: "Hello World !"
//   };
// }

// // -----------------------------------------------------------------
// // https://www.sergevandenoever.nl/Processing-multipart-form-data-in-nodejs-azure-function-with-httptrigger/
// // -----------------------------------------------------------------
// const MemoryStream = require("memorystream");
// const multer = require("multer");
// const upload = multer({ storage: multer.memoryStorage() });
// const merge = require("deepmerge");

// module.exports = async function (context, req) {
//   var stream = new MemoryStream(req.body);
//   for (let key in req) {
//     if (req.hasOwnProperty(key)) {
//       stream[key] = req[key];
//     }
//   }

//   upload.any()(stream, null, (err) => {
//     const f = stream.files[0];
//     context.bindings.res = {
//       status: 200,
//       body: "OK"
//     };
//   });

// };

// -----------------------------------------------------------------
// https://www.sergevandenoever.nl/Processing-multipart-form-data-in-nodejs-azure-function-with-httptrigger/
// -----------------------------------------------------------------
const busboy = require("busboy");
const fs = require("fs");
const path = require("path");

var readOut = async function (context, req) {
  return new Promise((resolve, reject) => {
    var form = {};
    var bb = busboy({ headers: req.headers });

    bb.on("file", (name, file, info) => {
      console.log(`file: ${name}`);
      var bytes = [];
      file.on("data", (chunk) => {
        bytes.push(chunk);
      });
      file.on("end", () => {
        form[name] = {
          buffer: Buffer.concat(bytes),
          ...info
        };
      });
      file.resume();
      // ------------
      // form[name] = {
      //   stream: file,
      //   ...info
      // };
      // ------------
      // var writer = fs.createWriteStream(path.join("C:\\work", info.filename));
      // writer.on("close", () => {
      //   file.resume();
      // });
      // file.pipe(writer);
    });
    bb.on("field", (name, value, info) => {
      console.log(`name: ${name}  --> value: ${value}`);
      form[name] = value;
    });
    bb.on("error", (err) => {
      reject(err);
    });
    bb.on("finish", () => {
      resolve(form);
    });

    bb.end(req.body);
  });
};

module.exports = async function (context, req) {
  var form;
  try {
    form = await readOut(context, req);
    context.bindings.res = {
      status: 200,
      body: "OK"
    };
  } catch (err) {
    context.bindings.res = {
      status: 500,
      body: "ERROR"
    };
  }
};


// -----------------------------------------------------------------
// https://qiita.com/amay077/items/9aa0893e2e1a53234c3f
// -----------------------------------------------------------------
// const multer = require("multer");
// const streams = require("memory-streams");
// const upload = multer({ storage: multer.memoryStorage() })

// module.exports = function (context, req) {
//   context.log('JavaScript HTTP trigger function processed a request.');
//   const stream = new streams.ReadableStream(req.body);
//   for (const key in req) {
//     if (req.hasOwnProperty(key)) {
//       stream[key] = req[key];
//     }
//   }
//   context.stream = stream;

//   upload.any()(stream, null, (err) => {
//     const f = context.stream.files[0]
//     const p = path.join(__dirname, `./${f.originalname}`);
//     fs.writeFileSync(p, f.buffer);
//     context.res = { body: `Upload ${f.originalname} done.` };
//     context.done();
//   });
// };