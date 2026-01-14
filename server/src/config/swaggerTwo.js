// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Pharmaciano API",
    description: "Automatic API documentation",
  },
  host: "localhost:5000",
  schemes: ["http"],
};

const outputFile = "../../swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
