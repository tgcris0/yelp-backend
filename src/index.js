require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const client = require("./client");
const app = express();

app.use(bodyParser.json());

app.get("/restaurants", (req, res) => {
  client
    .query("SELECT * FROM restaurants")
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.get("/restaurants/:id", (req, res) => {
  const { id } = req.params;
  const text =
    "SELECT r.id, r.name, ct.name, c.text, c.date FROM restaurants AS r INNER JOIN comments AS c ON c.restaurant_id = r.id INNER JOIN city AS ct ON ct.id = r.city_id WHERE r.id=$1";
  const values = [id];

  client
    .query(text, values)
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.get("/city", (req, res) => {
  client
    .query("SELECT * FROM city")
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.get("/city/:id", async (req, res) => {
  const { id } = req.params;
  const cityQuery = `
    SELECT * FROM city WHERE id=$1
   `;
  const restaurantQuery = `
      SELECT 
      r.name AS restaurant_name
      FROM restaurants AS r
      INNER JOIN city AS ct ON r.city_id = ct.id
      WHERE ct.id=$1;
      `;
  try {
    const { rows: cityRows } = await client.query(cityQuery, [id]);
    if (!cityRows.length) res.sendStatus(404);
    const { rows: restaurantRows } = await client.query(restaurantQuery, [id]);

    res.send({
      city_name: cityRows[0].name,
      city_id: cityRows[0].id,
      restaurants: restaurantRows
    });
  } catch (err) {
    console.log(err.message);
  }

  /*    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err)); */
});

app.get("/tag", (req, res) => {
  client
    .query("SELECT * FROM tag")
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.get("/tag/:id", (req, res) => {
  const { id } = req.params;
  const tagQuery =
    "SELECT r.name AS rest_name, ct.name AS city_name, t.name as tag_name FROM restaurants AS r INNER JOIN city AS ct ON ct.id = r.city_id INNER JOIN restaurant_has_tag AS rht ON rht.id_restaurant = r.id INNER JOIN tag AS t ON rht.id_tag = t.id WHERE t.id=$1;";

  client
    .query(tagQuery, [id])
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
