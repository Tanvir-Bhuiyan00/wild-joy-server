const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//* middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hinjtmc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("wildJoyDB").collection("toys");
    const newToysCollection = client.db("wildJoyDB").collection("newToys");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toyDetails = await toysCollection.findOne(query);
      res.send(toyDetails);
    });

    //* New Toys

    app.get("/newToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const result = await newToysCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/newToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const newToys = await newToysCollection.findOne(query);
      res.send(newToys);
    });

    app.post("/newToys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await newToysCollection.insertOne(newToys);
      res.send(result);
    });

    app.put("/newToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;
      const toys = {
        $set: {
          photo: updatedToys.photo,
          sellerName: updatedToys.sellerName,
          email: updatedToys.email,
          availableQuantity: updatedToys.availableQuantity,
          detailDescription: updatedToys.detailDescription,
          price: updatedToys.price,
          rating: updatedToys.rating,
          subCategory: updatedToys.subCategory,
          toyName: updatedToys.toyName,
        },
      };
      const result = await newToysCollection.updateOne(filter, toys, options);
      res.send(result);
    });

    app.delete("/newToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newToysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Joy is running");
});

app.listen(port, () => {
  console.log(`Wild Joy Server is running on port ${port}`);
});
