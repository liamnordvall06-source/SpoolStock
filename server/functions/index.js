const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const app = express();
app.use(express.json());


//* OPEN REQUESTS */


app.get(("/company/:companyId"), async (req, res) => {
    try {
        const { companyId } = req.params();

        const companyRef = db.collection("company").doc(companyId);
        const companyDoc = await companyRef.get();

        if (!companyDoc.exists) {
            return res.status(404).json({ error: "Company not found" });
        }

        return res.json({ id: companyDoc.id, ...companyDoc.data() });

    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: e.message });        
    }
})

app.get(("/company/:companyId/stock"), async (req, res) => {
    try {
        const { companyId } = req.params;

        const stockRef = db.collection("company").doc(companyId).collection("stock");

        const stockSnapshot = await stockRef.get();

        if (stockSnapshot.empty) {
        return res.status(404).json({ error: "No stock data found for this company" });
        }

        const stockData = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.json(stockData);

    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: e.message });        
    }
})

app.get(("/company/:companyId/transactions"), async (req, res) => {
    try {
        const { companyId } = req.params;

        const transcationsRef = db.collection("company").doc(companyId).collection("transactions");

        const transcationsSnapshot = await transcationsRef.get();

        if (transcationsSnapshot.empty) {
        return res.status(404).json({ error: "No transcation data found for this company" });
        }

        const transactionsData = transcationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.json(transactionsData);

    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: e.message });        
    }
})

app.post("/company/:companyId/stock", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { productId, quantity } = req.body; 

    if (!productId || quantity == null) {
      return res.status(400).json({ error: "productId and quantity are required" });
    }

    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productData = productDoc.data();

    const stockRef = db.collection("company").doc(companyId).collection("stock").doc(productId);
    const stockDoc = await stockRef.get();

    if (stockDoc.exists) {
      const newQuantity = stockDoc.data().quantity - parseInt(quantity); 

      if (newQuantity < 0) {
        return res.status(400).json({ error: "Insufficient stock to remove" });
      }

      await stockRef.update({ quantity: newQuantity });
    }

    const transactionsRef = db.collection("company").doc(companyId).collection("transactions");
    await transactionsRef.add({
      productId,
      productName: productData.productName,
      quantity,
      type: "withdrawal",
      productWeight: productData.productWeight,
      date: new Date(),
      productCost: productData.productCost 
    });

    return res.json({ message: "Stock and transaction updated successfully" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.get(("/company/:companyId/turnover"), async (req, res) => {
    try {
        const { companyId } = req.params;

        const turnoverRef = db.collection("company").doc(companyId).collection("turnover");

        const turnoverSnapshot = await turnoverRef.get();

        if (turnoverSnapshot.empty) {
        return res.status(404).json({ error: "No transcation data found for this company" });
        }

        const turnoverData = turnoverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.json(turnoverData);
    } catch (e) {
        logger.error(e);
        return res.status(500).json({ error: e.message });        
    }
})


//** PROTECTED REQUESTS */


// app.get(("/customer"), async () => {
//     try {

//     } catch (e) {
//         logger.error(e);
//         return res.status(500).json({ error: e.message });        
//     }
// })

// app.get(("/customer/:customerId"), async () => {
//     try {

//     } catch (e) {
//         logger.error(e);
//         return res.status(500).json({ error: e.message });        
//     }
// })

// app.post(("/customer/:customerId/assign"), async () => {
//     try {

//     } catch (e) {
//         logger.error(e);
//         return res.status(500).json({ error: e.message });        
//     }
// })

app.get("/customer/:customerId", async (req, res) => {
  console.log("Customer request:", req.params.customerId); // log the incoming UID
  try {
    const { customerId } = req.params;
    const doc = await db.collection("customers").doc(customerId).get();
    if (!doc.exists) return res.status(404).json({ error: "Customer not found" });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});



app.get("/company", async (req, res) => {
  try {
    const snapshot = await db.collection("company").get();
    const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(companies);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.post("/company", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await db.collection("company").add(data);
    const newCompany = await docRef.get();
    return res.json({ id: docRef.id, ...newCompany.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const doc = await db.collection("company").doc(companyId).get();
    if (!doc.exists) return res.status(404).json({ error: "Company not found" });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});


app.post("/company/:companyId/transactions/deposite", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ error: "productId and quantity required" });
    }

    // Fetch product details
    const productDoc = await db.collection("products").doc(productId).get();
    if (!productDoc.exists) return res.status(404).json({ error: "Product not found" });

    const productData = productDoc.data();

    const stockRef = db
      .collection("company")
      .doc(companyId)
      .collection("stock")
      .doc(productId);

    const stockDoc = await stockRef.get();

    if (stockDoc.exists) {
      // Update existing stock
      const existingData = stockDoc.data();
      const newQty = (existingData.quantity || 0) + quantity;

      await stockRef.set(
        {
          ...existingData,
          ...productData,
          quantity: newQty, // update quantity
        },
        { merge: true }
      );
    } else {
      // Create new stock document with correct quantity
      await stockRef.set({
        ...productData,
        quantity, // <-- important!
      });
    }

    // Add transaction record
    await db
      .collection("company")
      .doc(companyId)
      .collection("transactions")
      .add({
        productId,
        productName: productData.productName,
        quantity,
        type: "deposite",
        date: new Date(),
        productCost: productData.productCost,
      });

    return res.json({ message: "Transaction completed successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});



app.get("/product", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(products);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.post("/product", async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productImageUrl,
      productCost,
      productDistributor,
      productOriginalUrl,
      productWeight
    } = req.body;

    // Create the object
    const productData = {
      productName,
      productDescription,
      productImageUrl,
      productCost,
      productDistributor,
      productOriginalUrl,
      productWeight
    };

    // Add to Firestore
    const docRef = await db.collection("products").add(productData);

    const newProduct = await docRef.get();
    return res.json({ id: docRef.id, ...newProduct.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});


app.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const doc = await db.collection("products").doc(productId).get();
    if (!doc.exists) return res.status(404).json({ error: "Product not found" });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});


exports.api = onRequest(
  {
    cors: true, 
  },
  app
);
