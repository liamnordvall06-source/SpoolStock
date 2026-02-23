const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

const app = express();
app.use(express.json());



const SHOP = "qiiigm-di.myshopify.com";
const SHOPIFY_ADMIN_TOKEN = "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";
const API_VERSION = "2024-10";

//* OPEN REQUESTS */





app.get("/company/:companyId/stock", async (req, res) => {
  try {
    const { companyId } = req.params;

    const stockRef = db.collection("company")
      .doc(companyId)
      .collection("stock");

    const stockSnapshot = await stockRef.get();

    if (stockSnapshot.empty) {
      return res.status(404).json({ error: "No stock data found for this company" });
    }

    const stockMap = {};
    const variantIds = stockSnapshot.docs.map(doc => {
      const shopifyId = doc.id; 
      stockMap[shopifyId] = doc.data().quantity; // ✅ numeriskt ID som nyckel
      return `gid://shopify/ProductVariant/${shopifyId}`; // för GraphQL
    });

    const query = `
      query getVariants($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            title
            price
            image {
              url
            }
            product {
              title
              vendor
              onlineStoreUrl
              featuredImage {
                url
              }
              metafield(namespace: "custom", key: "weight") {
                value
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: { ids: variantIds },
        }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      return res.status(500).json({ error: result.errors });
    }

  const products = result.data.nodes
    .filter(Boolean)
    .map(variant => {
      const numericId = variant.id.split("/").pop(); // 123456789
      const quantity = stockMap[numericId] || 0; // ✅ nu matchar nyckeln

      return {
        variantId: numericId,
        productName: variant.product.title,
        variantName:
          variant.title === "Default Title"
            ? variant.product.title
            : `${variant.product.title} - ${variant.title}`,
        vendor: variant.product.vendor,
        price: variant.price,
        quantity, // ✅ korrekt
        productImage: variant.product.featuredImage?.url || null,
        variantImage: variant.image?.url || null,
        weight: variant.product.metafield?.value || null,
        variantUrl: variant.product.onlineStoreUrl
          ? `${variant.product.onlineStoreUrl}?variant=${numericId}`
          : null
      };
    });

    return res.json(products);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

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

app.post("/company/stock", async (req, res) => {
  try {

    const customerId = req.headers["x-customer-id"];
    const companyId = req.headers["x-company-id"];
    const shopifyId = req.headers["x-shopify-id"]
    const quantity = parseInt(req.headers["x-quantity"]);
    const customerProfileImage = req.headers["x-customer-image"] || "";

    if (!customerId || !companyId || !shopifyId || !quantity) {
        return res.status(400).json({ error: "Their are missing fields in the request" });
    }

    const customerRef = db.collection("customers").doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
        return res.status(404).json({ error: "Customer was not found in database" });
    }

    const customerData = customerDoc.data();

    const customerName = customerData.name;

    const normalizedVariantGid = shopifyId.startsWith("gid://")
        ? shopifyId
        : `gid://shopify/ProductVariant/${shopifyId}`;

    const query = `
      query VariantById($id: ID!) {
        productVariant(id: $id) {
          id
          title
          price
          displayName
          image { url altText }
          product {
            id
            title
            description
            featuredImage { url altText }
            images(first: 1) { edges { node { url altText } } }
            metafield(namespace: "custom", key: "weight") {
                value
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: { id: normalizedVariantGid },
        }),
      }
    );

    const json = await response.json();
    const variant = json?.data?.productVariant;

    const stockRef = db.collection("company").doc(companyId).collection("stock").doc(shopifyId);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
        return res.status(404).json({ error: "Customer stock was not found in database" });
    }

    const stockData = stockDoc.data();

    const newQuantity = parseInt(stockData.quantity) - parseInt(quantity); 

    if (newQuantity < 0) {
      return res.status(400).json({ error: "Quantity can not be under 0" });
    }

    await stockRef.update({ quantity: newQuantity });


    const transactionsRef = db.collection("company").doc(companyId).collection("transactions");

    await transactionsRef.add({
      date: new Date(),
      productCost: variant.price,
      shopifyId,
      productName: variant.displayName,
      productWeight: variant.product.metafield?.value || null,
      quantity,
      type: "withdrawal",
      image: variant.image,
      featuredImage: variant.product.featuredImage,
      customerName, 
      customerId,    
      customerProfileImage
    })

    return res.json({ message: "Stock and transaction updated successfully" });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});


app.get("/company/:companyId/article", async (req, res) => {
  try {
    const { companyId } = req.params;
    const shopifyId = req.headers["x-shopify-id"];

    const stockRef = db.collection("company").doc(companyId).collection("stock").doc(shopifyId);

    const stockSnapshot = await stockRef.get();

    if (stockSnapshot.empty) {
      return res.status(404).json({ error: "No stock data found for this company" });
    }

    const quantity = stockSnapshot.data().quantity;

    const normalizedVariantGid = shopifyId.startsWith("gid://")
        ? shopifyId
        : `gid://shopify/ProductVariant/${shopifyId}`;
  
    const query = `
      query VariantById($id: ID!) {
        productVariant(id: $id) {
          id
          title
          sku
          price
          displayName
          image { url altText }
          product {
            id
            title
            onlineStoreUrl
            description
            metafields(first: 100, namespace: "custom") {
            nodes {
              id
              key
              namespace
              value
              type

              definition {
                name
                description
              }
            }
          }
            featuredImage { url altText }
            images(first: 1) { edges { node { url altText } } }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          query,
          variables: { id: normalizedVariantGid },
        }),
      }
    );

    const json = await response.json();

    if (json.errors?.length) {
      return res.status(400).json({ errors: json.errors });
    }

    const variant = json?.data?.productVariant;
    if (!variant) return res.status(404).send("Variant not found");

    const numericId = variant.id.split("/").pop();

    const imageUrl =
      variant?.image?.url ||
      variant?.product?.featuredImage?.url ||
      variant?.product?.images?.edges?.[0]?.node?.url ||
      "";

    res.json({
      variantId: variant.id,
      quantity,
      productId: variant.product?.id,
      productName: variant.product?.title,
      variantTitle: variant.title,
      displayName: variant.displayName,
      sku: variant.sku,
      price: variant.price,
      stock: variant.inventoryQuantity,
      imageUrl,
      productDescription: variant.product?.description,
      metafields: variant.product?.metafields,
      variantUrl: variant.product.onlineStoreUrl
        ? `${variant.product.onlineStoreUrl}?variant=${numericId}`
        : null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});








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

// app.get("/customer/:customerId", async (req, res) => {
//   console.log("Customer request:", req.params.customerId); // log the incoming UID
//   try {
//     const { customerId } = req.params;
//     const doc = await db.collection("customers").doc(customerId).get();
//     if (!doc.exists) return res.status(404).json({ error: "Customer not found" });
//     return res.json({ id: doc.id, ...doc.data() });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: e.message });
//   }
// });



// app.get("/company", async (req, res) => {
//   try {
//     const snapshot = await db.collection("company").get();
//     const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     return res.json(companies);
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: e.message });
//   }
// });

// app.post("/company", async (req, res) => {
//   try {
//     const data = req.body;
//     const docRef = await db.collection("company").add(data);
//     const newCompany = await docRef.get();
//     return res.json({ id: docRef.id, ...newCompany.data() });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: e.message });
//   }
// });

// app.get("/company/:companyId", async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const doc = await db.collection("company").doc(companyId).get();
//     if (!doc.exists) return res.status(404).json({ error: "Company not found" });
//     return res.json({ id: doc.id, ...doc.data() });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ error: e.message });
//   }
// });








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
      await stockRef.set({
        ...productData,
        quantity,
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










































// // Shopify Endpoints
SHOPIFY_API_KEY="360c8f9f152a52b73d5d5ae3d07e9c9a"
SHOPIFY_API_SECRET="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"
SHOPIFY_SCOPES="read_products"
APP_URL="https://api-najddsqtfa-uc.a.run.app"
const TOKENS = {};


app.get("/shopify/auth", (req, res) => {
  const shop = req.query.shop; // *.myshopify.com
  const customerId = req.query.customerId; // <-- required
  const returnTo = req.query.return_to || ""; // optional (frontend URL)

  if (!shop) return res.status(400).send("Missing shop");
  if (!customerId) return res.status(400).send("Missing customerId");

  const nonce = crypto.randomBytes(16).toString("hex");
  const stateObj = { nonce, customerId, returnTo, shop };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

  const redirectUri = `${APP_URL}/shopify/callback`;

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${encodeURIComponent(SHOPIFY_SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  return res.redirect(installUrl);
});


app.get("/shopify/callback", async (req, res) => {
  try {
    const { shop, code, state } = req.query;
    if (!shop || !code) return res.status(400).send("Missing shop or code");
    if (!state) return res.status(400).send("Missing state");

    // Decode state
    let stateObj;
    try {
      stateObj = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch {
      return res.status(400).send("Invalid state");
    }

    const { customerId, returnTo } = stateObj || {};
    if (!customerId) return res.status(400).send("Missing customerId in state");

    // Exchange code for token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();
    if (!data.access_token) return res.status(400).json(data);

    // Save token to customer document
    await db.collection("customers").doc(customerId).set(
      {
        shopify: {
          shop,
          accessToken: data.access_token,
          scopes: SHOPIFY_SCOPES,
          installedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // Redirect back to frontend (optional)
    if (returnTo) {
      const url =
        `${returnTo}?shop=${encodeURIComponent(shop)}` +
        `&shopify_connected=1`;
      return res.redirect(url);
    }

    return res.send("App installed. Token saved to customer.");
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
  }
});


exports.api = onRequest(
  {
    cors: true, 
  },
  app
);
