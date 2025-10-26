import app from "./src/app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
