const { ObjectId } = require("../config/db");
const { stripe } = require("../config/stripe");

/**
 * Retrieve all donation campaigns.
 */
const getAllDonations = async (req, res) => {
  try {
    const result = await req.collections.donations.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve a single donation campaign by ID.
 */
const getDonationById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.donations.findOne(query);
    if (!result) return res.status(404).json({ error: "Campaign not found" });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid campaign ID" });
  }
};

/**
 * Create a new donation campaign.
 */
const createDonationCampaign = async (req, res) => {
  try {
    const campaign = req.body;
    const result = await req.collections.donations.insertOne(campaign);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update an existing donation campaign (PUT, PATCH, or /donations/update/:id).
 */
const updateDonationCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCampaign = req.body;
    const filter = { _id: new ObjectId(id) };

    const updateFields = {};
    if (updatedCampaign.pet_name !== undefined) updateFields.pet_name = updatedCampaign.pet_name;
    if (updatedCampaign.max_donation_amount !== undefined)
      updateFields.max_donation_amount = Number(updatedCampaign.max_donation_amount);
    if (updatedCampaign.donated_amount !== undefined)
      updateFields.donated_amount = Number(updatedCampaign.donated_amount);
    if (updatedCampaign.donor_count !== undefined)
      updateFields.donor_count = Number(updatedCampaign.donor_count);
    if (updatedCampaign.last_date !== undefined) updateFields.last_date = updatedCampaign.last_date;
    if (updatedCampaign.image !== undefined) updateFields.image = updatedCampaign.image;
    if (updatedCampaign.short_description !== undefined)
      updateFields.short_description = updatedCampaign.short_description;
    if (updatedCampaign.long_description !== undefined)
      updateFields.long_description = updatedCampaign.long_description;
    if (updatedCampaign.status !== undefined) updateFields.status = updatedCampaign.status;

    const result = await req.collections.donations.updateOne(filter, { $set: updateFields });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid campaign ID or payload" });
  }
};

/**
 * Delete a donation campaign.
 */
const deleteDonationCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.donations.deleteOne(query);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid campaign ID" });
  }
};

/**
 * Get campaigns created by a specific user email.
 */
const getAddedDonations = async (req, res) => {
  try {
    const email = req.query.email;
    const query = email ? { email } : {};
    const result = await req.collections.donations.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create a Stripe PaymentIntent.
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { price } = req.body;
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured on this environment." });
    }
    const amount = parseInt(Number(price) * 100, 10);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.max(50, amount),
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Record a successful payment in the payments collection.
 */
const recordPayment = async (req, res) => {
  try {
    const paymentInfo = req.body;
    const result = await req.collections.payments.insertOne(paymentInfo);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllDonations,
  getDonationById,
  createDonationCampaign,
  updateDonationCampaign,
  deleteDonationCampaign,
  getAddedDonations,
  createPaymentIntent,
  recordPayment,
};
